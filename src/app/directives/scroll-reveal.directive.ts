import {
  AfterViewInit,
  Directive,
  ElementRef,
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

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, this.revealClass);
          this.observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer.disconnect();
  }
}
