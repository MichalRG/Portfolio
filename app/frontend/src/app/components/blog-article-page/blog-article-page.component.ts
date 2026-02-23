import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, catchError, finalize, of, switchMap } from 'rxjs';
import { BLOG_ARTICLES } from '../../data/blog/blog-articles.data';
import {
  estimateReadTimeMinutes,
  formatBlogDate,
  getLocalizedArticle,
  getRelatedArticles,
  renderMarkdownArticle,
} from '../../data/blog/blog.helpers';
import { BlogArticle } from '../../interfaces/blog-article.interface';
import { BlogComment } from '../../interfaces/blog-comment.interface';
import {
  BlogCommentsService,
  CreateBlogCommentInput,
} from '../../services/blog-comments.service';
import { FooterComponent } from '../landing-page/footer/footer.component';

interface BlogArticleViewModel {
  slug: string;
  title: string;
  description: string;
  tags: readonly string[];
  publishedAtFormatted: string;
  estimatedReadMinutes: number;
  contentHtml: SafeHtml;
  toc: { id: string; text: string; level: 2 | 3 }[];
}

interface BlogRelatedArticleViewModel {
  slug: string;
  title: string;
  description: string;
}

const EMAIL_WITH_TLD_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

@Component({
  selector: 'app-blog-article-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    FooterComponent,
  ],
  templateUrl: './blog-article-page.component.html',
  styleUrls: ['./blog-article-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BlogArticlePageComponent implements OnInit {
  readonly articleView = computed<BlogArticleViewModel | null>(() => {
    const article = this.selectedArticle();
    if (!article) {
      return null;
    }

    const language = this.currentLanguage();
    const localizedContent = getLocalizedArticle(article, language);
    const renderedArticle = renderMarkdownArticle(
      localizedContent.contentMarkdown,
    );
    const trustedHtml = this.domSanitizer.bypassSecurityTrustHtml(
      renderedArticle.html,
    );

    return {
      slug: article.slug,
      title: localizedContent.title,
      description: localizedContent.description,
      tags: article.tags,
      publishedAtFormatted: formatBlogDate(article.publishedAt, language),
      estimatedReadMinutes: estimateReadTimeMinutes(
        localizedContent.contentMarkdown,
      ),
      contentHtml: trustedHtml,
      toc: renderedArticle.toc,
    };
  });

  readonly relatedArticles = computed<BlogRelatedArticleViewModel[]>(() => {
    const article = this.selectedArticle();
    if (!article) {
      return [];
    }

    const language = this.currentLanguage();
    return getRelatedArticles(article, BLOG_ARTICLES).map((relatedArticle) => {
      const localizedContent = getLocalizedArticle(relatedArticle, language);
      return {
        slug: relatedArticle.slug,
        title: localizedContent.title,
        description: localizedContent.description,
      };
    });
  });

  readonly currentLanguage = signal('en');
  readonly comments = signal<readonly BlogComment[]>([]);
  readonly commentsLoading = signal(false);
  readonly commentsError = signal(false);
  readonly submittingComment = signal(false);
  private readonly formBuilder = inject(FormBuilder);
  readonly commentForm = this.formBuilder.nonNullable.group({
    userName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(80)],
    ],
    email: ['', [Validators.email, Validators.pattern(EMAIL_WITH_TLD_PATTERN)]],
    content: ['', [Validators.required, Validators.maxLength(2000)]],
    honeypot: [''],
  });
  private readonly selectedArticle = signal<BlogArticle | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly toastr = inject(ToastrService);
  private readonly document = inject(DOCUMENT);
  private readonly domSanitizer = inject(DomSanitizer);
  private readonly blogCommentsService = inject(BlogCommentsService);

  constructor() {
    this.currentLanguage.set(this.translateService.currentLang || 'en');

    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLanguage.set(event.lang);
      });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((paramMap) => {
          this.resetCommentsState();

          const slug = paramMap.get('slug');
          const article = BLOG_ARTICLES.find((entry) => entry.slug === slug);

          if (!article) {
            this.selectedArticle.set(null);
            void this.router.navigate(['/blog'], { replaceUrl: true });
            return EMPTY;
          }

          this.selectedArticle.set(article);
          this.commentsLoading.set(true);

          return this.blogCommentsService.listComments(article.slug).pipe(
            catchError(() => {
              this.commentsError.set(true);
              return of([] as readonly BlogComment[]);
            }),
          );
        }),
      )
      .subscribe((comments) => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      });
  }

  trackByTocId(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByRelatedSlug(_: number, article: BlogRelatedArticleViewModel): string {
    return article.slug;
  }

  trackByCommentId(_: number, comment: BlogComment): string {
    return comment.id;
  }

  submitComment(): void {
    if (this.submittingComment()) {
      return;
    }

    if (this.commentForm.invalid) {
      this.commentForm.markAllAsTouched();
      return;
    }

    const article = this.selectedArticle();
    if (!article) {
      return;
    }

    const formValue = this.commentForm.getRawValue();
    const userName = formValue.userName.trim();
    const content = formValue.content.trim();
    const email = formValue.email.trim();

    if (!userName || !content) {
      this.commentForm.controls.userName.setValue(userName);
      this.commentForm.controls.content.setValue(content);
      this.commentForm.markAllAsTouched();
      return;
    }

    const createInput: CreateBlogCommentInput = {
      userName,
      content,
      email: email || null,
      honeypot: formValue.honeypot,
    };

    this.submittingComment.set(true);
    this.blogCommentsService
      .createComment(article.slug, createInput)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.submittingComment.set(false);
        }),
      )
      .subscribe({
        next: (createdComment) => {
          this.comments.update((items) => [createdComment, ...items]);
          this.commentForm.reset({
            userName: '',
            email: '',
            content: '',
            honeypot: '',
          });
          this.toastr.success(
            this.translateService.instant(
              'BLOG.COMMENTS.CREATE_SUCCESS_MESSAGE',
            ),
            this.translateService.instant('BLOG.COMMENTS.CREATE_SUCCESS_TITLE'),
          );
        },
        error: () => {
          this.toastr.error(
            this.translateService.instant('BLOG.COMMENTS.CREATE_ERROR_MESSAGE'),
            this.translateService.instant('BLOG.COMMENTS.CREATE_ERROR_TITLE'),
          );
        },
      });
  }

  async shareArticle(): Promise<void> {
    const urlToShare = this.resolveArticleUrl();
    const copied = await this.copyToClipboard(urlToShare);

    if (copied) {
      const title = this.translateService.instant('BLOG.SHARE_SUCCESS_TITLE');
      const message = this.translateService.instant(
        'BLOG.SHARE_SUCCESS_MESSAGE',
      );
      this.toastr.success(message, title);
      return;
    }

    const fallbackTitle = this.translateService.instant(
      'BLOG.SHARE_ERROR_TITLE',
    );
    const fallbackMessage = this.translateService.instant(
      'BLOG.SHARE_ERROR_MESSAGE',
    );
    this.toastr.error(fallbackMessage, fallbackTitle);
  }

  private resolveArticleUrl(): string {
    const location = this.document.defaultView?.location;
    if (location?.href) {
      return location.href;
    }

    return this.router.url;
  }

  private async copyToClipboard(value: string): Promise<boolean> {
    const navigatorRef = this.document.defaultView?.navigator;

    if (navigatorRef?.clipboard?.writeText) {
      try {
        await navigatorRef.clipboard.writeText(value);
        return true;
      } catch {
        return false;
      }
    }

    const body = this.document.body;
    if (!body) {
      return false;
    }

    const textarea = this.document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    body.appendChild(textarea);
    textarea.select();

    const copied = this.document.execCommand('copy');
    body.removeChild(textarea);
    return copied;
  }

  private resetCommentsState(): void {
    this.comments.set([]);
    this.commentsLoading.set(false);
    this.commentsError.set(false);
    this.submittingComment.set(false);
    this.commentForm.reset({
      userName: '',
      email: '',
      content: '',
      honeypot: '',
    });
  }
}
