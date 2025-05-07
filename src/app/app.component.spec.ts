import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from './app.component';
import { HeaderComponent } from './componenets/header/header.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterOutlet,
        HeaderComponent,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should have showIntro initially true', () => {
    expect(component.showIntro).toBeTrue();
  });

  it('should set showIntro to false after 1500ms', fakeAsync(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.showIntro).toBeTrue();

    tick(1500);
    fixture.detectChanges();

    expect(component.showIntro).toBeFalse();
  }));
});
