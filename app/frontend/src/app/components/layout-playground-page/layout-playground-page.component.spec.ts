import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutPlaygroundPageComponent } from './layout-playground-page.component';

describe('LayoutPlaygroundPageComponent', () => {
  let component: LayoutPlaygroundPageComponent;
  let fixture: ComponentFixture<LayoutPlaygroundPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPlaygroundPageComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutPlaygroundPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
