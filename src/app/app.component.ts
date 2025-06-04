import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, filter, tap, delay } from 'rxjs';
import { HeaderComponent } from './componenets/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, HeaderComponent],
})
export class AppComponent implements OnInit {
  showIntro = true;
  showTransition = false;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
    }, 1500);

    const start$ = this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      tap(() => (this.showTransition = true)),
    );

    const end$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      delay(300),
      tap(() => (this.showTransition = false)),
    );

    merge(start$, end$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
