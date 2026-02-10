export const BLOG_LANGUAGE_CODES = ['en', 'pl'] as const;

export type BlogLanguageCode = (typeof BLOG_LANGUAGE_CODES)[number];

export interface LocalizedBlogContent {
  en: string;
  pl: string;
}

export interface BlogArticleLocaleContent {
  title: string;
  description: string;
  contentMarkdown: string;
}

export interface BlogArticle {
  slug: string;
  tags: readonly string[];
  publishedAt: string;
  locales: Record<BlogLanguageCode, BlogArticleLocaleContent>;
}

export interface BlogTocItem {
  id: string;
  text: string;
  level: 2 | 3;
}
