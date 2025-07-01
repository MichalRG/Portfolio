import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  CSP_NONCE,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ToastrModule } from 'ngx-toastr';
import { routes } from './app.routes';
import { TOASTR_TIMEOUT_MS } from './constants/ui.constants';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'en',
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        positionClass: 'toast-top-right',
        timeOut: TOASTR_TIMEOUT_MS,
        preventDuplicates: true,
      }),
    ),
    {
      provide: CSP_NONCE,
      useFactory: () =>
        document
          .querySelector('meta[name="csp-nonce"]')
          ?.getAttribute('content') ?? '',
    },
  ],
};
