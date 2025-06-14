import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { HeaderComponent } from './componenets/header/header.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let events$: Subject<NavigationStart | NavigationEnd>;

  beforeEach(async () => {
    events$ = new Subject<NavigationStart | NavigationEnd>();
    routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigateByUrl', 'createUrlTree', 'parseUrl', 'serializeUrl'],
      {
        events: events$.asObservable(),
        url: '/',
      },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routerSpy.parseUrl.and.returnValue({} as any);
    routerSpy.createUrlTree.and.returnValue(routerSpy.parseUrl('/mock'));
    routerSpy.serializeUrl.and.returnValue('/mock');

    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterOutlet,
        HeaderComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should have showIntro initially true', () => {
    expect(component.showIntro).toBeTrue();
  });

  it('should set showIntro to false after 1500ms', fakeAsync(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.showIntro).toBeTrue();

    tick(1500);
    fixture.detectChanges();

    expect(component.showIntro).toBeFalse();
  }));

  it('should toggle transition overlay on navigation', fakeAsync(() => {
    events$.next(new NavigationStart(1, '/'));
    fixture.detectChanges();
    expect(component.showTransition).toBeTrue();

    events$.next(new NavigationEnd(1, '/', '/'));
    tick(300);
    fixture.detectChanges();
    expect(component.showTransition).toBeFalse();
  }));
});
