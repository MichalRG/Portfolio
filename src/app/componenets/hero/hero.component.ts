import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, interval, timer } from 'rxjs';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit {
  messages = ['HERO.TITLE-1', 'HERO.TITLE-2'];
  currentMessage = this.messages[0];
  currentBackground = 'bg-0';
  isTextVisible = true;

  private index = 0;
  private intervalSub?: Subscription;

  ngOnInit() {
    this.intervalSub = interval(10_000).subscribe(() => {
      this.isTextVisible = false;
      timer(1_500).subscribe(() => {
        this.index = (this.index + 1) % 2;
        this.currentBackground = `bg-${this.index}`;
        this.currentMessage = this.messages[this.index];
        this.isTextVisible = true;
      });
    });
  }

  ngOnDestroy() {
    this.intervalSub?.unsubscribe();
  }
}
