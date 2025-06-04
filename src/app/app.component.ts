import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
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

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.showTransition = true;
        }

        if (event instanceof NavigationEnd) {
          timer(300)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.showTransition = false;
            });
        }
      });
  }
}
