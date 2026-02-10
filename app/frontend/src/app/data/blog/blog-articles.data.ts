import { BlogArticle } from '../../interfaces/blog-article.interface';
import { BUILDING_STATIC_BLOG_CONTENT } from './content/building-static-blog-with-angular.content';
import { COMMENTS_API_WITH_FASTAPI_AND_DYNAMODB_CONTENT } from './content/comments-api-with-fastapi-and-dynamodb.content';
import { FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT } from './content/frontend-performance-with-angular-signals.content';

export const BLOG_ARTICLES: readonly BlogArticle[] = [
  {
    slug: 'building-static-blog-with-angular',
    publishedAt: '2026-02-08',
    tags: ['Angular', 'Architecture', 'AWS'],
    locales: {
      en: {
        title: 'Building a Static Blog with Angular and S3',
        description:
          'How I added markdown-driven blog pages to an Angular portfolio hosted on S3 and CloudFront.',
        contentMarkdown: BUILDING_STATIC_BLOG_CONTENT.en,
      },
      pl: {
        title: 'Statyczny blog w Angularze i S3',
        description:
          'Jak dodalem blog oparty o markdown do portfolio Angular hostowanego na S3 i CloudFront.',
        contentMarkdown: BUILDING_STATIC_BLOG_CONTENT.pl,
      },
    },
  },
  {
    slug: 'comments-api-with-fastapi-and-dynamodb',
    publishedAt: '2026-02-07',
    tags: ['FastAPI', 'DynamoDB', 'Serverless'],
    locales: {
      en: {
        title: 'Comment API with FastAPI, Lambda and DynamoDB',
        description:
          'A compact backend design for blog comments with moderation and anti-spam controls.',
        contentMarkdown: COMMENTS_API_WITH_FASTAPI_AND_DYNAMODB_CONTENT.en,
      },
      pl: {
        title: 'API komentarzy z FastAPI, Lambda i DynamoDB',
        description:
          'Zwarty projekt backendu komentarzy z moderacja i ochrona przed spamem.',
        contentMarkdown: COMMENTS_API_WITH_FASTAPI_AND_DYNAMODB_CONTENT.pl,
      },
    },
  },
  {
    slug: 'frontend-performance-with-angular-signals',
    publishedAt: '2026-02-06',
    tags: ['Angular', 'Performance', 'Frontend'],
    locales: {
      en: {
        title: 'Frontend Performance with Angular Signals',
        description:
          'Practical lessons from migrating component state to Angular signals and computed values.',
        contentMarkdown: FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT.en,
      },
      pl: {
        title: 'Wydajnosc frontendu z Angular Signals',
        description:
          'Praktyczne wnioski z migracji stanu komponentow do Angular Signals i computed.',
        contentMarkdown: FRONTEND_PERFORMANCE_WITH_ANGULAR_SIGNALS_CONTENT.pl,
      },
    },
  },
];
