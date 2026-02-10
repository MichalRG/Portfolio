import { BLOG_ARTICLES } from './blog-articles.data';
import {
  estimateReadTimeMinutes,
  getLocalizedArticle,
  getRelatedArticles,
  renderMarkdownArticle,
} from './blog.helpers';

describe('blog.helpers', () => {
  it('should estimate read time with lower bound of one minute', () => {
    expect(estimateReadTimeMinutes('short text', 220)).toBe(1);

    const longMarkdown = new Array(440).fill('word').join(' ');
    expect(estimateReadTimeMinutes(longMarkdown, 220)).toBe(2);
  });

  it('should build toc from h2 and h3 headings only', () => {
    const markdown = [
      '## First section',
      'Paragraph',
      '### Nested section',
      '#### Should not appear',
      '## First section',
    ].join('\n');

    const result = renderMarkdownArticle(markdown);
    expect(result.toc).toEqual([
      { id: 'first-section', text: 'First section', level: 2 },
      { id: 'nested-section', text: 'Nested section', level: 3 },
      { id: 'first-section-2', text: 'First section', level: 2 },
    ]);
  });

  it('should return localized article content', () => {
    const article = BLOG_ARTICLES[0];
    const localized = getLocalizedArticle(article, 'pl-PL');
    expect(localized.title).toContain('blog');
  });

  it('should prioritize related articles by shared tags and date', () => {
    const current = BLOG_ARTICLES[0];
    const related = getRelatedArticles(current, BLOG_ARTICLES);

    expect(related.length).toBeGreaterThan(0);
    expect(related[0].slug).toBe('frontend-performance-with-angular-signals');
  });
});
