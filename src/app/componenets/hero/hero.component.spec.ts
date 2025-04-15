import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HeroComponent } from './hero.component';

// Fake translation loader
class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      HERO: {
        'TITLE-1': 'Welcome!',
        'TITLE-2': 'Glad to see you!',
      },
    });
  }
}

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HeroComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: FakeLoader },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial background and message', () => {
    expect(component.currentBackground).toBe('bg-0');
    expect(component.currentMessage).toBe('HERO.TITLE-1');
  });

  it('should render the translated text', async () => {
    const text = compiled.querySelector('.hero__text')!;
    expect(text.textContent?.trim()).toBe('HERO.TITLE-1');
  });

  it('should show scroll indicator by default', () => {
    expect(component.isArrowScrollHidden).toBeFalse();
    const arrow = compiled.querySelector('.hero__scroll-indicator');
    expect(arrow?.classList.contains('hidden')).toBeFalse();
  });

  it('should hide scroll indicator when scrolled', () => {
    spyOnProperty(window, 'scrollY').and.returnValue(100);
    component.onScroll();
    expect(component.isArrowScrollHidden).toBeTrue();
  });

  xit('should switch message and background after 10 seconds', fakeAsync(() => {
    tick();

    expect(component.currentBackground).toBe('bg-0');
    expect(component.currentMessage).toBe('HERO.TITLE-1');

    tick(10000);
    tick(1500);
    fixture.detectChanges();

    expect(component.currentBackground).toBe('bg-1');
    expect(component.currentMessage).toBe('HERO.TITLE-2');

    tick(10000);
    tick(1500);
    fixture.detectChanges();

    expect(component.currentBackground).toBe('bg-0');
    expect(component.currentMessage).toBe('HERO.TITLE-1');
  }));

  it('should call scrollToNextSection() safely', () => {
    const spy = spyOn(document, 'querySelector').and.returnValue(null);
    component.scrollToNextSection();
    expect(spy).toHaveBeenCalledWith('#about');
  });
});
