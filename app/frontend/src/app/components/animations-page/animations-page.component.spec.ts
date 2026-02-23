import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AnimationsPageComponent } from './animations-page.component';

describe('AnimationsPageComponent', () => {
  let component: AnimationsPageComponent;
  let fixture: ComponentFixture<AnimationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AnimationsPageComponent,
        TranslateModule.forRoot(), // required by TranslatePipe in template
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain 6 animation examples', () => {
    expect(component.animationExamples.length).toBe(6);
  });

  it('should have required keys in each animation example', () => {
    component.animationExamples.forEach((example) => {
      expect(example.title).toBeDefined();
      expect(example.animationClass).toBeDefined();
      expect(example.codeSnippet).toBeDefined();
    });
  });

  it('should contain the fade-in animation as first item', () => {
    const first = component.animationExamples[0];
    expect(first).toEqual(
      jasmine.objectContaining({
        title: 'ANIMATIONS.FADEIN',
        animationClass: 'fade-in',
      }),
    );
  });
});
