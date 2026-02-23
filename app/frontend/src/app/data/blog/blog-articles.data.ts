import { BlogArticle } from '../../interfaces/blog-article.interface';
import { FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT } from './content/frontend-performance-with-angular-signals.content';

export const BLOG_ARTICLES: readonly BlogArticle[] = [
  {
    slug: 'test',
    publishedAt: '2026-02-06',
    tags: ['TEST'],
    locales: {
      en: {
        title: "It's just a test article",
        description:
          'Practical lessons from migrating component state to Angular signals and computed values.',
        contentMarkdown: FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT.en,
      },
      pl: {
        title: 'To jest tylko artykuł testowy',
        description:
          'Praktyczne wnioski z migracji stanu komponentow do Angular Signals i computed.',
        contentMarkdown: FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT.pl,
      },
    },
  },
];
