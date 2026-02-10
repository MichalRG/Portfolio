import { convertToParamMap, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { BlogArticlePageComponent } from './blog-article-page.component';

describe('BlogArticlePageComponent', () => {
  let component: BlogArticlePageComponent;
  let fixture: ComponentFixture<BlogArticlePageComponent>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const paramMapSubject = new BehaviorSubject(
    convertToParamMap({ slug: 'building-static-blog-with-angular' }),
  );

  beforeEach(async () => {
    toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
    ]);

    await TestBed.configureTestingModule({
      imports: [BlogArticlePageComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ToastrService, useValue: toastrSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMapSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogArticlePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
    expect(component.articleView()).not.toBeNull();
  });

  it('should expose toc entries for headings', () => {
    const article = component.articleView();
    expect(article).not.toBeNull();
    expect(article?.toc.length ?? 0).toBeGreaterThan(0);
  });

  it('should render headings with ids for toc anchors', () => {
    const heading = fixture.nativeElement.querySelector(
      '.blog-article-page__article h2',
    ) as HTMLElement | null;

    expect(heading).not.toBeNull();
    expect(heading?.id).toBeTruthy();
  });

  it('should show success toast when share succeeds', async () => {
    const componentWithPrivateApi = component as unknown as {
      copyToClipboard(value: string): Promise<boolean>;
    };
    spyOn(componentWithPrivateApi, 'copyToClipboard').and.resolveTo(true);

    await component.shareArticle();

    expect(toastrSpy.success).toHaveBeenCalled();
    expect(toastrSpy.error).not.toHaveBeenCalled();
  });
});
