import { CommonModule, DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  Renderer2,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { LANGUAGES } from '../../constants/language.constants';
import {
  DROPDOWN_HIDE_DELAY_MS,
  HEADER_SECTION_IDS,
  HEADER_SECTION_OBSERVER_MAX_RETRIES,
  HEADER_SECTION_OBSERVER_RETRY_DELAY_MS,
  HEADER_SECTION_OBSERVER_ROOT_MARGIN,
  HEADER_SECTION_OBSERVER_THRESHOLD,
} from '../../constants/ui.constants';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  readonly languages = LANGUAGES;
  showDropdownSig = signal(false);
  dropdownOpenSig = signal(false);
  currentLanguageSig = signal('en');
  authService = inject(AuthService);
  mobileMenuOpen = signal(false);
  activeSection = signal('home');

  readonly isLoggedIn = this.authService.isLoggedIn;

  private hideTimeout?: ReturnType<typeof setTimeout>;
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private renderer = inject(Renderer2);
  private languageService = inject(LanguageService);
  private document = inject(DOCUMENT);
  private sectionObserver?: IntersectionObserver;
  private readonly sectionIds = HEADER_SECTION_IDS;
  private observeRetryCount = 0;
  private observeTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    this.currentLanguageSig.set(this.translateService.currentLang || 'en');
  }

  ngOnInit(): void {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLanguageSig.set(event.lang);
      });

    this.destroyRef.onDestroy(() => {
      this.disconnectSectionObserver();
      if (this.observeTimeout) {
        clearTimeout(this.observeTimeout);
      }
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
      }
    });

    this.updateActiveFromUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateActiveFromUrl(this.router.url);
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  changeLanguage(lang: string) {
    this.languageService.useLanguage(lang);
    this.currentLanguageSig.set(lang);
    this.dropdownOpenSig.set(false);
  }

  onMouseEnterLanguage() {
    clearTimeout(this.hideTimeout);
    this.showDropdownSig.set(true);
    this.dropdownOpenSig.set(true);
  }

  onMouseLeaveLanguage() {
    this.hideTimeout = setTimeout(() => {
      this.dropdownOpenSig.set(false);
    }, DROPDOWN_HIDE_DELAY_MS);
  }

  onAnimationEnd() {
    if (!this.dropdownOpenSig()) {
      this.showDropdownSig.set(false);
    }
  }

  toggleMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());

    // Toggle body overflow to prevent scrolling when menu is open
    this.renderer.setStyle(
      this.document.body,
      'overflow',
      this.mobileMenuOpen() ? 'hidden' : '',
    );
  }

  closeMenu() {
    if (!this.mobileMenuOpen()) {
      return;
    }

    this.mobileMenuOpen.set(false);
    this.renderer.setStyle(this.document.body, 'overflow', '');
  }

  private updateActiveFromUrl(url: string) {
    const [pathPart, fragment] = url.split('#');
    const path = pathPart.split('?')[0];
    const section = fragment ?? '';

    if (this.isBlogPath(path)) {
      this.activeSection.set('blog');
      this.observeRetryCount = 0;
      this.disconnectSectionObserver();
      return;
    }

    if (path !== '/') {
      this.activeSection.set(path.replace('/', ''));
      this.observeRetryCount = 0;
      this.disconnectSectionObserver();
      return;
    }

    this.activeSection.set(section || 'home');
    this.observeSections();
  }

  private observeSections() {
    this.ensureSectionObserver();
    const foundAny = this.observeSectionElements();
    this.scheduleObserveRetry(foundAny);
  }

  private ensureSectionObserver() {
    if (this.sectionObserver) {
      return;
    }

    this.sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          this.activeSection.set(visible.target.id);
        }
      },
      {
        root: null,
        threshold: HEADER_SECTION_OBSERVER_THRESHOLD,
        rootMargin: HEADER_SECTION_OBSERVER_ROOT_MARGIN,
      },
    );
  }

  private observeSectionElements(): boolean {
    let foundAny = false;
    this.sectionIds.forEach((id) => {
      const section = this.document.getElementById(id);
      if (section) {
        foundAny = true;
        this.sectionObserver?.observe(section);
      }
    });

    if (foundAny) {
      this.observeRetryCount = 0;
    }

    return foundAny;
  }

  private scheduleObserveRetry(foundAny: boolean) {
    if (
      foundAny ||
      this.observeRetryCount >= HEADER_SECTION_OBSERVER_MAX_RETRIES
    ) {
      return;
    }

    this.observeRetryCount += 1;
    this.observeTimeout = setTimeout(() => {
      this.disconnectSectionObserver();
      this.observeSections();
    }, HEADER_SECTION_OBSERVER_RETRY_DELAY_MS);
  }

  private disconnectSectionObserver() {
    this.sectionObserver?.disconnect();
    this.sectionObserver = undefined;
  }

  private isBlogPath(path: string): boolean {
    const normalizedPath = path.replace(/\/+$/, '');
    return (
      normalizedPath === '/blog' ||
      normalizedPath.startsWith('/blog/') ||
      normalizedPath === '/pl/blog' ||
      normalizedPath.startsWith('/pl/blog/')
    );
  }
}
