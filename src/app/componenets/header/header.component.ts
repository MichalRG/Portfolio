import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LANGUAGES } from '../../constants/language.constants';
import { LANGUAGE_STORAGE_KEY } from '../../constants/local-storage.constants';
import { DROPDOWN_HIDE_DELAY_MS } from '../../constants/ui.constants';

@Component({
  selector: 'app-header',
  imports: [TranslateModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  languages = LANGUAGES;
  showDropdown = false;
  dropdownOpen = false;
  currentLanguage = 'en';
  private hideTimeout?: ReturnType<typeof setTimeout>;

  constructor(private translateService: TranslateService) {
    const currentLocalStorageLanguage =
      localStorage.getItem(LANGUAGE_STORAGE_KEY);
    this.translateService.setDefaultLang(currentLocalStorageLanguage || 'en');
    this.translateService.use(currentLocalStorageLanguage || 'en');
    this.currentLanguage = this.translateService.currentLang || 'en';
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
