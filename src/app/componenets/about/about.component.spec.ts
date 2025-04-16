import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { AboutComponent } from './about.component';

fdescribe('AboutComponent', () => {
  let fixture: ComponentFixture<AboutComponent>;
  let component: AboutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutComponent, TranslateModule.forRoot()],
      providers: [provideAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should split tags into chunks of 6', () => {
    const sample = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const result = component['chunkTags'](sample, 6);
    expect(result.length).toBe(2);
    expect(result[0].length).toBe(6);
    expect(result[1].length).toBe(1);
  });

  it('should render all 3 description lines', () => {
    const lines = fixture.debugElement.queryAll(By.css('.about__line'));
    expect(lines.length).toBe(3);
  });

  it('should render interest tags', () => {
    const interestTags = fixture.debugElement.queryAll(
      By.css('.about__tag--secondary'),
    );
    expect(interestTags.length).toBe(component.interestTags.length);
  });

  it('should apply scroll reveal directive to each line', () => {
    const lines = fixture.debugElement.queryAll(
      By.directive(ScrollRevealDirective),
    );
    expect(lines.length).toBe(3);
  });
});
