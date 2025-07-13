import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { interval, Subscription, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  messages = ['HERO.TITLE-1', 'HERO.TITLE-2'];
  currentMessage = this.messages[0];
  currentBackground = 'bg-0';
  isTextVisible = true;
  isArrowScrollHidden = false;
  hasEntered = false;
  backgrounds = [
    '/assets/images/hero/backgroundMoon.png',
    '/assets/images/hero/backgroundMars.png',
  ];

  backgroundIndex = 0;
  private intervalSub?: Subscription;
  private readonly cdr = inject(ChangeDetectorRef);

  @HostListener('window:scroll')
  onScroll() {
    this.isArrowScrollHidden = window.scrollY > 100;
  }

  ngOnInit() {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (!prefersReducedMotion) {
      this.intervalSub = interval(10_000)
        .pipe(
          tap(() => {
            this.isTextVisible = false;
            this.cdr.markForCheck();
          }),
          switchMap(() => timer(1_500)),
        )
        .subscribe(() => {
          this.backgroundIndex =
            (this.backgroundIndex + 1) % this.backgrounds.length;
          this.currentBackground = `bg-${this.backgroundIndex}`;
          this.currentMessage = this.messages[this.backgroundIndex];
          this.isTextVisible = true;
          this.cdr.markForCheck();
        });
    }
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.hasEntered = true;
        this.cdr.markForCheck();
      });
    });
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }

  scrollToNextSection() {
    const nextSection = document.querySelector('#about');

    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
