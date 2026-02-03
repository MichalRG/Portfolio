import { CommonModule } from '@angular/common';
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
import { DROPDOWN_HIDE_DELAY_MS } from '../../constants/ui.constants';
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
  showDropdown = false;
  dropdownOpen = false;
  currentLanguage = 'en';
  authService = inject(AuthService);
  currentPath = signal<string>('/');
  mobileMenuOpen = signal(false);

  readonly isLoggedIn = this.authService.isLoggedIn;

  private hideTimeout?: ReturnType<typeof setTimeout>;
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);
  private renderer = inject(Renderer2);
  private languageService = inject(LanguageService);

  constructor() {
    this.currentLanguage = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    const initialPath = this.router.url.split('?')[0].split('#')[0];
    this.currentPath.set(initialPath);

    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.currentLanguage = event.lang;
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const path = this.router.url.split('?')[0].split('#')[0];
        this.currentPath.set(path);
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  changeLanguage(lang: string) {
    this.languageService.useLanguage(lang);
    this.currentLanguage = lang;
    this.dropdownOpen = false;
  }

  onMouseEnterLanguage() {
    clearTimeout(this.hideTimeout);
    this.showDropdown = true;
    this.dropdownOpen = true;
  }

  onMouseLeaveLanguage() {
    this.hideTimeout = setTimeout(() => {
      this.dropdownOpen = false;
    }, DROPDOWN_HIDE_DELAY_MS);
  }

  onAnimationEnd() {
    if (!this.dropdownOpen) {
      this.showDropdown = false;
    }
  }

  toggleMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());

    // Toggle body overflow to prevent scrolling when menu is open
    this.renderer.setStyle(
      document.body,
      'overflow',
      this.mobileMenuOpen() ? 'hidden' : '',
    );
  }
}
