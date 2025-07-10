import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  private title = inject(Title);
  private meta = inject(Meta);
  private translate = inject(TranslateService);

  ngOnInit() {
    setTimeout(() => {
      this.showIntro = false;
      this.cdRef.markForCheck();
    }, 1500);

    const start$ = this.router.events.pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      tap(() => {
        this.showTransition = true;
        this.cdRef.markForCheck();
      }),
    );

    const end$ = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      delay(300),
      tap(() => {
        this.showTransition = false;
        this.cdRef.markForCheck();
      }),
    );

    merge(start$, end$).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();

    this.translate.get('HOME.TITLE').subscribe((t) => this.title.setTitle(t));
    this.translate
      .get('HOME.META_DESCRIPTION')
      .subscribe((desc) =>
        this.meta.updateTag({ name: 'description', content: desc }),
      );
  }
}
