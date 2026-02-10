import { LocalizedBlogContent } from '../../../interfaces/blog-article.interface';

export const BUILDING_STATIC_BLOG_CONTENT: LocalizedBlogContent = {
  en: `## Why static pages
I wanted every article page to be fast, simple, and easy to deploy.
Static output works well for SEO and keeps hosting costs predictable.

## Content workflow
Each post lives in source control as markdown text.
During development I can update content without touching component logic.

### Authoring
I keep titles, description, tags, and publication date in typed metadata.
The body content stays in a dedicated file to keep structure clean.

### Build step
The app reads metadata and renders markdown content at runtime.
This gives a practical balance between flexibility and simplicity.

## Deployment notes
Because pages are static assets, deployment stays straightforward.
Any new article is just another commit and release.`,
  pl: `## Dlaczego strony statyczne
Chcialem, aby kazdy artykul ladowal sie szybko i byl prosty we wdrozeniu.
Statyczny output dobrze wspiera SEO i przewidywalne koszty hostingu.

## Workflow tresci
Kazdy wpis trzymam w repo jako markdown.
W trakcie pracy moge zmieniac tresc bez naruszania logiki komponentow.

### Pisanie
Tytul, opis, tagi i date publikacji trzymam w metadanych.
Sama tresc artykulu jest w osobnym pliku.

### Krok renderowania
Aplikacja czyta metadane i renderuje markdown w widoku.
To daje dobry balans miedzy elastycznoscia i prostota.

## Wdrozenie
Poniewaz strony sa statyczne, publikacja jest prosta.
Nowy artykul to po prostu kolejny commit i release.`,
};
