import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPlaygroundPageComponent } from './layout-playground-page.component';

describe('LayoutPlaygroundPageComponent', () => {
  let component: LayoutPlaygroundPageComponent;
  let fixture: ComponentFixture<LayoutPlaygroundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPlaygroundPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPlaygroundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
