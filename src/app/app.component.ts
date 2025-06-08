import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { delay, filter, merge, tap } from 'rxjs';
import { HeaderComponent } from './componenets/header/header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  showIntro = true;
  showTransition = false;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private cdRef = inject(ChangeDetectorRef);

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
      this.cdRef.markForCheck();
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
