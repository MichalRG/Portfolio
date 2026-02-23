import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LandingPageComponent } from './landing-page.component';

import { ToastrService } from 'ngx-toastr';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { FooterComponent } from './footer/footer.component';
import { HeroComponent } from './hero/hero.component';
import { ProjectsComponent } from './projects/projects.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    const mockToastrService = jasmine.createSpyObj('ToastrService', [
      'success',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LandingPageComponent,
        HeroComponent,
        AboutComponent,
        ContactComponent,
        FooterComponent,
        ProjectsComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the landing page component', () => {
    expect(component).toBeTruthy();
  });
});
