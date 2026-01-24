import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { delay, filter, merge, tap } from 'rxjs';
import { HeaderComponent } from './componenets/header/header.component';
import { DEFAULT_LANGUAGE, LANGUAGES } from './constants/language.constants';
import { LANGUAGE_STORAGE_KEY } from './constants/local-storage.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  showIntro = true;
  showTransition = false;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);
  private title = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);

  constructor() {
    const supportedLanguages = LANGUAGES.map((lang) => lang.code);
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = navigator.language.split('-')[0];
    const pathLanguage = window.location.pathname.startsWith('/pl')
      ? 'pl'
      : null;

    const resolvedLanguage =
      (pathLanguage && supportedLanguages.includes(pathLanguage)
        ? pathLanguage
        : null) ||
      (storedLanguage && supportedLanguages.includes(storedLanguage)
        ? storedLanguage
        : null) ||
      (supportedLanguages.includes(browserLanguage)
        ? browserLanguage
        : DEFAULT_LANGUAGE);

    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.translate.use(resolvedLanguage);
    this.setDocumentLanguage(resolvedLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage);

    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => this.setDocumentLanguage(event.lang));
  }

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
      this.cdRef.markForCheck();
    }, 1500);

    const start$ = this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      tap(() => {
        this.showTransition = true;
        this.cdRef.markForCheck();
      }),
    );

    const end$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      delay(300),
      tap(() => {
        this.showTransition = false;
        this.cdRef.markForCheck();
      }),
    );

    merge(start$, end$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.translate
      .get('HOME.META_DESCRIPTION')
      .subscribe((desc) =>
        this.meta.updateTag({ name: 'description', content: desc }),
      );
  }

  private setDocumentLanguage(language: string) {
    this.document.documentElement.setAttribute('lang', language);
  }
}
