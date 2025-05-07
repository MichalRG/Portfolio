import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from './header.component';

class MockAuthService {
  logout = jasmine.createSpy('logout');
  isLoggedIn = jasmine.createSpy('isLoggedIn').and.returnValue(true);
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let events$: Subject<NavigationEnd>;
  authServiceSpy = jasmine.createSpyObj('AuthService', [
    'logout',
    'isLoggedIn',
  ]);
  authServiceSpy.isLoggedIn.and.returnValue(true);

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
    routerSpy.parseUrl.and.returnValue({} as any);
    routerSpy.serializeUrl.and.returnValue('/mocked-serialized-url');

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: {} },
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
    const setItemSpy = spyOn(localStorage, 'setItem');
    component.changeLanguage('pl');

    expect(component.currentLanguage).toBe('pl');
    expect(setItemSpy).toHaveBeenCalledWith('language', 'pl');
    expect(component.dropdownOpen).toBeFalse();
  });

  it('should call logout and redirect to /login', () => {
    const authService = TestBed.inject(AuthService);

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
  });

  it('should handle language dropdown mouse enter/leave', () => {
    component.onMouseEnterLanguage();
    expect(component.showDropdown).toBeTrue();
    expect(component.dropdownOpen).toBeTrue();

    jasmine.clock().install();
    component.onMouseLeaveLanguage();
    jasmine.clock().tick(500); // DROPDOWN_HIDE_DELAY_MS
    expect(component.dropdownOpen).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should hide dropdown on animation end if dropdownOpen is false', () => {
    component.dropdownOpen = false;
    component.showDropdown = true;

    component.onAnimationEnd();

    expect(component.showDropdown).toBeFalse();
  });

  it('should update currentPath on NavigationEnd', () => {
    events$.next(new NavigationEnd(1, '/projects', '/projects'));
    expect(component.currentPath()).toBe('/projects');
  });
});
