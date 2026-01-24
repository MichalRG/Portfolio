import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
} from './app/constants/language.constants';
import { LANGUAGE_STORAGE_KEY } from './app/constants/local-storage.constants';

const getLocaleRedirect = (): string | null => {
  const supportedLanguages = LANGUAGES.map((lang) => lang.code);
  const browserLanguage = navigator.language.split('-')[0];
  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const isPlPath =
    window.location.pathname === '/pl' ||
    window.location.pathname.startsWith('/pl/');

  if (
    !storedLanguage &&
    !isPlPath &&
    supportedLanguages.includes(browserLanguage) &&
    browserLanguage !== DEFAULT_LANGUAGE
  ) {
    return `/${browserLanguage}/`;
  }

  return null;
};

const redirectTarget = getLocaleRedirect();
if (redirectTarget) {
  window.location.replace(redirectTarget);
} else {
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
}
