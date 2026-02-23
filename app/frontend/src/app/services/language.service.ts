import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../constants/language.constants';
import { LANGUAGE_STORAGE_KEY } from '../constants/local-storage.constants';

const getSupportedLanguageCodes = (): string[] =>
  LANGUAGES.map((lang) => lang.code);

const normalizeLanguage = (language: string): string => language.split('-')[0];

const getPathLanguage = (pathname: string): string | null =>
  pathname === '/pl' || pathname.startsWith('/pl/') ? 'pl' : null;

const resolveLanguage = (
  pathname: string,
  browserLanguage: string,
  storedLanguage: string | null,
): string => {
  const supportedLanguages = getSupportedLanguageCodes();
  const normalizedBrowserLanguage = normalizeLanguage(browserLanguage);
  const pathLanguage = getPathLanguage(pathname);

  return (
    (pathLanguage && supportedLanguages.includes(pathLanguage)
      ? pathLanguage
      : null) ||
    (storedLanguage && supportedLanguages.includes(storedLanguage)
      ? storedLanguage
      : null) ||
    (supportedLanguages.includes(normalizedBrowserLanguage)
      ? normalizedBrowserLanguage
      : DEFAULT_LANGUAGE)
  );
};

export const getLocaleRedirectTarget = (
  pathname: string,
  browserLanguage: string,
  storedLanguage: string | null,
): string | null => {
  const supportedLanguages = getSupportedLanguageCodes();
  const normalizedBrowserLanguage = normalizeLanguage(browserLanguage);
  const pathLanguage = getPathLanguage(pathname);

  if (
    !storedLanguage &&
    !pathLanguage &&
    supportedLanguages.includes(normalizedBrowserLanguage) &&
    normalizedBrowserLanguage !== DEFAULT_LANGUAGE
  ) {
    return `/${normalizedBrowserLanguage}/`;
  }

  return null;
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  initLanguage(): string {
    const resolvedLanguage = resolveLanguage(
      window.location.pathname,
      navigator.language,
      localStorage.getItem(LANGUAGE_STORAGE_KEY),
    );

    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.useLanguage(resolvedLanguage);

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.setDocumentLanguage(event.lang);
      });

    return resolvedLanguage;
  }

  useLanguage(language: string): void {
    this.translate.use(language);
    this.setDocumentLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }

  private setDocumentLanguage(language: string): void {
    this.document.documentElement.setAttribute('lang', language);
  }
}
