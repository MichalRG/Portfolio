import {
  BLOG_DEFAULT_RELATED_POST_LIMIT,
  BLOG_WORDS_PER_MINUTE,
} from '../../constants/blog.constants';
import {
  BLOG_LANGUAGE_CODES,
  BlogArticle,
  BlogArticleLocaleContent,
  BlogLanguageCode,
  BlogTocItem,
} from '../../interfaces/blog-article.interface';

interface RenderedArticle {
  html: string;
  toc: BlogTocItem[];
}

const EMPTY_SECTION_SLUG = 'section';
const BLOG_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const toPlainHeadingText = (value: string): string =>
  value
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();

const normalizeHeadingSlug = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || EMPTY_SECTION_SLUG;

const getUniqueHeadingId = (
  headingText: string,
  idMap: Map<string, number>,
): string => {
  const baseSlug = normalizeHeadingSlug(headingText);
  const currentCount = idMap.get(baseSlug) ?? 0;
  idMap.set(baseSlug, currentCount + 1);

  if (currentCount === 0) {
    return baseSlug;
  }

  return `${baseSlug}-${currentCount + 1}`;
};

const stripMarkdownForWordCount = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[#>*_[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const flushParagraph = (
  paragraphLines: string[],
  htmlParts: string[],
): void => {
  if (paragraphLines.length === 0) {
    return;
  }

  const paragraphText = paragraphLines.join(' ');
  htmlParts.push(`<p>${escapeHtml(paragraphText)}</p>`);
  paragraphLines.length = 0;
};

const flushList = (listItems: string[], htmlParts: string[]): void => {
  if (listItems.length === 0) {
    return;
  }

  const items = listItems
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  htmlParts.push(`<ul>${items}</ul>`);
  listItems.length = 0;
};

const flushCodeBlock = (
  codeLines: string[],
  htmlParts: string[],
  language?: string,
): void => {
  if (codeLines.length === 0) {
    return;
  }

  const escapedCode = escapeHtml(codeLines.join('\n'));
  const className = language ? ` class="language-${escapeHtml(language)}"` : '';
  htmlParts.push(`<pre><code${className}>${escapedCode}</code></pre>`);
  codeLines.length = 0;
};

const compareDatesDesc = (left: string, right: string): number =>
  new Date(right).getTime() - new Date(left).getTime();

export const resolveBlogLanguage = (
  language: string | undefined,
): BlogLanguageCode => {
  if (!language) {
    return 'en';
  }

  const normalized = language.toLowerCase().split('-')[0];
  const supported = BLOG_LANGUAGE_CODES as readonly string[];
  return supported.includes(normalized)
    ? (normalized as BlogLanguageCode)
    : 'en';
};

export const getLocalizedArticle = (
  article: BlogArticle,
  language: string | undefined,
): BlogArticleLocaleContent => {
  const resolvedLanguage = resolveBlogLanguage(language);
  return article.locales[resolvedLanguage];
};

export const estimateReadTimeMinutes = (
  markdown: string,
  wordsPerMinute = BLOG_WORDS_PER_MINUTE,
): number => {
  const plainText = stripMarkdownForWordCount(markdown);
  if (!plainText) {
    return 1;
  }

  const words = plainText.split(' ').length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

export const formatBlogDate = (
  dateIso: string,
  language: string | undefined,
): string => {
  const resolvedLanguage = resolveBlogLanguage(language);
  return new Intl.DateTimeFormat(
    resolvedLanguage,
    BLOG_DATE_FORMAT_OPTIONS,
  ).format(new Date(dateIso));
};

export const renderMarkdownArticle = (markdown: string): RenderedArticle => {
  const normalizedMarkdown = markdown.replaceAll('\r\n', '\n');
  const lines = normalizedMarkdown.split('\n');
  const htmlParts: string[] = [];
  const toc: BlogTocItem[] = [];
  const idMap = new Map<string, number>();
  const paragraphLines: string[] = [];
  const listItems: string[] = [];
  const codeLines: string[] = [];

  let inCodeBlock = false;
  let codeLanguage: string | undefined;

  for (const rawLine of lines) {
    const trimmedLine = rawLine.trim();

    if (inCodeBlock) {
      if (trimmedLine.startsWith('```')) {
        flushCodeBlock(codeLines, htmlParts, codeLanguage);
        inCodeBlock = false;
        codeLanguage = undefined;
        continue;
      }

      codeLines.push(rawLine);
      continue;
    }

    if (trimmedLine.startsWith('```')) {
      flushParagraph(paragraphLines, htmlParts);
      flushList(listItems, htmlParts);
      inCodeBlock = true;
      codeLanguage = trimmedLine.slice(3).trim() || undefined;
      continue;
    }

    if (!trimmedLine) {
      flushParagraph(paragraphLines, htmlParts);
      flushList(listItems, htmlParts);
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph(paragraphLines, htmlParts);
      flushList(listItems, htmlParts);

      const headingLevel = Math.min(6, headingMatch[1].length);
      const headingText = toPlainHeadingText(headingMatch[2]);
      const headingId = getUniqueHeadingId(headingText, idMap);
      const safeHeadingText = escapeHtml(headingText);

      htmlParts.push(
        `<h${headingLevel} id="${headingId}">${safeHeadingText}</h${headingLevel}>`,
      );

      if (headingLevel === 2 || headingLevel === 3) {
        toc.push({
          id: headingId,
          text: headingText,
          level: headingLevel,
        });
      }

      continue;
    }

    const listMatch = trimmedLine.match(/^- (.*)$/);
    if (listMatch) {
      flushParagraph(paragraphLines, htmlParts);
      listItems.push(listMatch[1].trim());
      continue;
    }

    paragraphLines.push(trimmedLine);
  }

  if (inCodeBlock) {
    flushCodeBlock(codeLines, htmlParts, codeLanguage);
  }
  flushParagraph(paragraphLines, htmlParts);
  flushList(listItems, htmlParts);

  return {
    html: htmlParts.join(''),
    toc,
  };
};

export const getRelatedArticles = (
  currentArticle: BlogArticle,
  articles: readonly BlogArticle[],
  limit = BLOG_DEFAULT_RELATED_POST_LIMIT,
): BlogArticle[] => {
  const currentTags = new Set(currentArticle.tags);

  const scoredArticles = articles
    .filter((article) => article.slug !== currentArticle.slug)
    .map((article) => {
      const overlapCount = article.tags.reduce(
        (score, tag) => (currentTags.has(tag) ? score + 1 : score),
        0,
      );
      return { article, overlapCount };
    })
    .sort((left, right) => {
      if (right.overlapCount !== left.overlapCount) {
        return right.overlapCount - left.overlapCount;
      }
      return compareDatesDesc(
        left.article.publishedAt,
        right.article.publishedAt,
      );
    });

  const related = scoredArticles
    .filter((entry) => entry.overlapCount > 0)
    .slice(0, limit)
    .map((entry) => entry.article);

  if (related.length >= limit) {
    return related;
  }

  const existingSlugs = new Set(related.map((article) => article.slug));
  for (const entry of scoredArticles) {
    if (existingSlugs.has(entry.article.slug)) {
      continue;
    }

    related.push(entry.article);
    existingSlugs.add(entry.article.slug);

    if (related.length >= limit) {
      break;
    }
  }

  return related;
};
