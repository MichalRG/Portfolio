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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BLOG_ARTICLES } from '../../data/blog/blog-articles.data';
import {
  estimateReadTimeMinutes,
  formatBlogDate,
  getLocalizedArticle,
  getRelatedArticles,
  renderMarkdownArticle,
} from '../../data/blog/blog.helpers';
import { BlogArticle } from '../../interfaces/blog-article.interface';
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

@Component({
  selector: 'app-blog-article-page',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, FooterComponent],
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
    const renderedArticle = renderMarkdownArticle(localizedContent.contentMarkdown);
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
  private readonly selectedArticle = signal<BlogArticle | null>(null);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translateService = inject(TranslateService);
  private readonly toastr = inject(ToastrService);
  private readonly document = inject(DOCUMENT);
  private readonly domSanitizer = inject(DomSanitizer);

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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((paramMap) => {
        const slug = paramMap.get('slug');
        const article = BLOG_ARTICLES.find((entry) => entry.slug === slug);

        if (!article) {
          void this.router.navigate(['/blog'], { replaceUrl: true });
          return;
        }

        this.selectedArticle.set(article);
      });
  }

  trackByTocId(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByRelatedSlug(_: number, article: BlogRelatedArticleViewModel): string {
    return article.slug;
  }

  async shareArticle(): Promise<void> {
    const urlToShare = this.resolveArticleUrl();
    const copied = await this.copyToClipboard(urlToShare);

    if (copied) {
      const title = this.translateService.instant('BLOG.SHARE_SUCCESS_TITLE');
      const message = this.translateService.instant('BLOG.SHARE_SUCCESS_MESSAGE');
      this.toastr.success(message, title);
      return;
    }

    const fallbackTitle = this.translateService.instant('BLOG.SHARE_ERROR_TITLE');
    const fallbackMessage = this.translateService.instant('BLOG.SHARE_ERROR_MESSAGE');
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
}
