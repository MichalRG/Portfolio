import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationsPageComponent } from './animations-page.component';

describe('AnimationsPageComponent', () => {
  let component: AnimationsPageComponent;
  let fixture: ComponentFixture<AnimationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationsPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
