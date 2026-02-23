import { convertToParamMap, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BlogArticlePageComponent } from './blog-article-page.component';
import { BlogComment } from '../../interfaces/blog-comment.interface';
import { BlogCommentsService } from '../../services/blog-comments.service';

describe('BlogArticlePageComponent', () => {
  let component: BlogArticlePageComponent;
  let fixture: ComponentFixture<BlogArticlePageComponent>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let commentsServiceSpy: jasmine.SpyObj<BlogCommentsService>;

  const paramMapSubject = new BehaviorSubject(
    convertToParamMap({ slug: 'test' }),
  );

  beforeEach(async () => {
    paramMapSubject.next(convertToParamMap({ slug: 'test' }));

    toastrSpy = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
    ]);
    commentsServiceSpy = jasmine.createSpyObj<BlogCommentsService>(
      'BlogCommentsService',
      ['listComments'],
    );
    commentsServiceSpy.listComments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [BlogArticlePageComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ToastrService, useValue: toastrSpy },
        { provide: BlogCommentsService, useValue: commentsServiceSpy },
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
    expect(commentsServiceSpy.listComments).toHaveBeenCalledWith('test');
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

  it('should render loaded comments', () => {
    const comments: readonly BlogComment[] = [
      {
        id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        parentCommentId: null,
        postSlug: 'test',
        userName: 'Jane Doe',
        content: 'This architecture looks clean and practical.',
        email: null,
        createdAt: '2026-02-22T21:00:00Z',
        updatedAt: '2026-02-22T21:00:00Z',
        deletedAt: null,
      },
    ];
    commentsServiceSpy.listComments.and.returnValue(of(comments));

    paramMapSubject.next(convertToParamMap({ slug: 'test' }));
    fixture.detectChanges();

    const authorElement = fixture.nativeElement.querySelector(
      '.blog-article-page__comment-author',
    ) as HTMLElement | null;
    const contentElement = fixture.nativeElement.querySelector(
      '.blog-article-page__comment-content',
    ) as HTMLElement | null;

    expect(authorElement?.textContent).toContain('Jane Doe');
    expect(contentElement?.textContent).toContain(
      'This architecture looks clean and practical.',
    );
  });
});
