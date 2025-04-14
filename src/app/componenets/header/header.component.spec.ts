import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HeaderComponent } from './header.component';

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      HEADER: {
        LOGO: 'MK',
        HOME: 'Home',
        ABOUT: 'About',
        PROJECTS: 'Projects',
        CONTACT: 'Contact',
      },
    });
  }
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.nav__logo')?.textContent?.trim()).toBe(
      'MK',
    );
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('.nav__link');
    expect(links.length).toBe(4); // Home, About, Projects, Contact
  });

  it('should render language switcher button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.nav__language-btn');
    expect(button).toBeTruthy();
    expect(button?.textContent?.trim()).toContain('EN');
  });

  it('should open dropdown on mouseenter', fakeAsync(() => {
    component.onMouseEnterLanguage();
    fixture.detectChanges();
    tick();
    expect(component.showDropdown).toBeTrue();
    expect(component.dropdownOpen).toBeTrue();
  }));

  it('should close dropdown after mouseleave with delay', fakeAsync(() => {
    component.onMouseEnterLanguage();
    fixture.detectChanges();
    tick();
    component.onMouseLeaveLanguage();
    fixture.detectChanges();
    tick(500);
    expect(component.dropdownOpen).toBeFalse();
  }));

  it('should change language and update currentLanguage', () => {
    component.changeLanguage('pl');
    expect(component.currentLanguage).toBe('pl');
  });
});
