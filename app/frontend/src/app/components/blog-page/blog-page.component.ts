import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FooterComponent } from '../landing-page/footer/footer.component';
import { BLOG_ARTICLES } from '../../data/blog/blog-articles.data';
import {
  estimateReadTimeMinutes,
  formatBlogDate,
  getLocalizedArticle,
} from '../../data/blog/blog.helpers';

interface BlogArticleCardViewModel {
  slug: string;
  title: string;
  description: string;
  tags: readonly string[];
  publishedAtFormatted: string;
  estimatedReadMinutes: number;
}

@Component({
  standalone: true,
  selector: 'app-blog-page',
  templateUrl: './blog-page.component.html',
  styleUrls: ['./blog-page.component.scss'],
  imports: [CommonModule, TranslateModule, RouterModule, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogPageComponent {
  readonly searchQuery = signal('');
  readonly currentLanguage = signal('en');

  readonly filteredArticles = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const articles = this.articleCards();

    if (!query) {
      return articles;
    }

    return articles.filter((article) =>
      article.title.toLowerCase().includes(query),
    );
  });

  private readonly sortedArticles = [...BLOG_ARTICLES].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );
  private readonly articleCards = computed<BlogArticleCardViewModel[]>(() => {
    const language = this.currentLanguage();

    return this.sortedArticles.map((article) => {
      const localizedContent = getLocalizedArticle(article, language);
      return {
        slug: article.slug,
        title: localizedContent.title,
        description: localizedContent.description,
        tags: article.tags,
        publishedAtFormatted: formatBlogDate(article.publishedAt, language),
        estimatedReadMinutes: estimateReadTimeMinutes(
          localizedContent.contentMarkdown,
        ),
      };
    });
  });

  private readonly translateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.currentLanguage.set(this.translateService.currentLang || 'en');

    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLanguage.set(event.lang);
      });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchQuery.set(target?.value ?? '');
  }

  trackBySlug(_: number, article: BlogArticleCardViewModel): string {
    return article.slug;
  }
}
