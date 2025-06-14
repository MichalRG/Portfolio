import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScrollRevealDirective } from './scroll-reveal.directive';
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
let intersectionCallback: Function;

class MockIntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  constructor(cb: Function) {
    intersectionCallback = cb;
  }

  observe = jasmine.createSpy('observe');
  unobserve = jasmine.createSpy('unobserve');
  disconnect = jasmine.createSpy('disconnect');
}

@Component({
  template: `
    <p appScrollReveal [revealClass]="'active-test'" class="test-target">
      Reveal me!
    </p>
  `,
  standalone: true,
  imports: [ScrollRevealDirective],
})
class TestComponent {}

describe('ScrollRevealDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let el: DebugElement;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).IntersectionObserver = MockIntersectionObserver;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    el = fixture.debugElement.query(By.css('.test-target'));
    fixture.detectChanges();
  });

  it('should create the directive and attach to element', () => {
    expect(el).toBeTruthy();
  });

  it('should add the reveal class when intersecting', () => {
    intersectionCallback([
      {
        isIntersecting: true,
        target: el.nativeElement,
      },
    ]);

    fixture.detectChanges();
    expect(el.nativeElement.classList.contains('active-test')).toBeTrue();
  });

  it('should unobserve after intersecting once', () => {
    intersectionCallback([
      {
        isIntersecting: true,
        target: el.nativeElement,
      },
    ]);

    fixture.detectChanges();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = el.injector.get(ScrollRevealDirective) as any;
    expect(instance.observer.unobserve).toHaveBeenCalledWith(el.nativeElement);
  });

  it('should support custom revealClass input', () => {
    intersectionCallback([
      {
        isIntersecting: true,
        target: el.nativeElement,
      },
    ]);

    fixture.detectChanges();
    expect(el.nativeElement.classList.contains('active-test')).toBeTrue();
  });

  it('should NOT add class if not intersecting', () => {
    intersectionCallback([
      {
        isIntersecting: false,
        target: el.nativeElement,
      },
    ]);

    fixture.detectChanges();
    expect(el.nativeElement.classList.contains('active-test')).toBeFalse();
  });
});
