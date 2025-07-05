import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnDestroy {
  @Input() revealClass = 'active';
  private observer!: IntersectionObserver;

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, this.revealClass);
          this.observer.unobserve(entry.target);
        }
      },
      {
        threshold: SCROLL_REVEAL_THRESHOLD,
        rootMargin: SCROLL_REVEAL_ROOT_MARGIN,
      },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
