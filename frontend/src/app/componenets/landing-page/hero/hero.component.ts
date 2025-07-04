import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, interval, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent implements OnInit, OnDestroy {
  messages = ['HERO.TITLE-1', 'HERO.TITLE-2'];
  currentMessage = this.messages[0];
  currentBackground = 'bg-0';
  isTextVisible = true;
  isArrowScrollHidden = false;

  private index = 0;
  private intervalSub?: Subscription;

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
          tap(() => (this.isTextVisible = false)),
          switchMap(() => timer(1_500)),
        )
        .subscribe(() => {
          this.index = (this.index + 1) % 2;
          this.currentBackground = `bg-${this.index}`;
          this.currentMessage = this.messages[this.index];
          this.isTextVisible = true;
        });
    }
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
