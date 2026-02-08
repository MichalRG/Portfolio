import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BlogPageComponent } from './blog-page.component';

describe('BlogPageComponent', () => {
  let component: BlogPageComponent;
  let fixture: ComponentFixture<BlogPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPageComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(BlogPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
