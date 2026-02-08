import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { HeaderComponent } from './header.component';

class MockAuthService {
  logout = jasmine.createSpy('logout');
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(true);
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let languageServiceSpy: jasmine.SpyObj<LanguageService>;
  let events$: Subject<NavigationEnd>;

  beforeEach(async () => {
    events$ = new Subject<NavigationEnd>();

    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigateByUrl', 'createUrlTree', 'parseUrl', 'serializeUrl'],
      {
        url: '/projects',
        events: events$.asObservable(),
      },
    );
    routerSpy.createUrlTree.and.returnValue(routerSpy.parseUrl('/mocked-url'));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routerSpy.parseUrl.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/mocked-serialized-url');

    languageServiceSpy = jasmine.createSpyObj('LanguageService', [
      'useLanguage',
    ]);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
        { provide: LanguageService, useValue: languageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should change language and update localStorage', () => {
    component.changeLanguage('pl');

    expect(languageServiceSpy.useLanguage).toHaveBeenCalledWith('pl');
    expect(component.currentLanguageSig()).toBe('pl');
    expect(component.dropdownOpenSig()).toBeFalse();
  });

  it('should call logout and redirect to /login', () => {
    const authService = TestBed.inject(AuthService);

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should handle language dropdown mouse enter/leave', () => {
    component.onMouseEnterLanguage();
    expect(component.showDropdownSig()).toBeTrue();
    expect(component.dropdownOpenSig()).toBeTrue();

    jasmine.clock().install();
    component.onMouseLeaveLanguage();
    jasmine.clock().tick(500); // DROPDOWN_HIDE_DELAY_MS
    expect(component.dropdownOpenSig()).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should hide dropdown on animation end if dropdownOpen is false', () => {
    component.dropdownOpenSig.set(false);
    component.showDropdownSig.set(true);

    component.onAnimationEnd();

    expect(component.showDropdownSig()).toBeFalse();
  });

  it('should update activeSection on NavigationEnd', () => {
    events$.next(new NavigationEnd(1, '/projects', '/projects'));
    expect(component.activeSection()).toBe('projects');
  });
});
