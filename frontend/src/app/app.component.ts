import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta } from '@angular/platform-browser';
import {
  NavigationEnd,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { delay, filter, merge, tap } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
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
  private meta = inject(Meta);
  private translate = inject(TranslateService);
  private languageService = inject(LanguageService);

  constructor() {
    this.languageService.initLanguage();
  }

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

    this.translate
      .get('HOME.META_DESCRIPTION')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((desc) =>
        this.meta.updateTag({ name: 'description', content: desc }),
      );
  }
}
