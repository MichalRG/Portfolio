import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { LANGUAGES } from '../../constants/language.constants';
import { LANGUAGE_STORAGE_KEY } from '../../constants/local-storage.constants';
import { DROPDOWN_HIDE_DELAY_MS } from '../../constants/ui.constants';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  languages = LANGUAGES;
  showDropdown = false;
  dropdownOpen = false;
  currentLanguage = 'en';
  authService = inject(AuthService);
  currentPath = signal<string>('/');

  readonly isLoggenIn = this.authService.isLoggedIn();

  private hideTimeout?: ReturnType<typeof setTimeout>;
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor(private translateService: TranslateService) {
    const currentLocalStorageLanguage =
      localStorage.getItem(LANGUAGE_STORAGE_KEY);
    this.translateService.setDefaultLang(currentLocalStorageLanguage || 'en');
    this.translateService.use(currentLocalStorageLanguage || 'en');
    this.currentLanguage = this.translateService.currentLang || 'en';
  }

  ngOnInit(): void {
    const initialPath = this.router.url.split('?')[0].split('#')[0];
    this.currentPath.set(initialPath);

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
    this.translateService.use(lang);
    this.currentLanguage = lang;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
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
}
