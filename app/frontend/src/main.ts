import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { LANGUAGE_STORAGE_KEY } from './app/constants/local-storage.constants';
import { getLocaleRedirectTarget } from './app/services/language.service';
const redirectTarget = getLocaleRedirectTarget(
  window.location.pathname,
  navigator.language,
  localStorage.getItem(LANGUAGE_STORAGE_KEY),
);
if (redirectTarget) {
  window.location.replace(redirectTarget);
} else {
  bootstrapApplication(AppComponent, appConfig).catch((err) =>
    console.error(err),
  );
}
