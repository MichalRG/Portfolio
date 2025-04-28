import { Component } from '@angular/core';
import { AboutComponent } from '../componenets/about/about.component';
import { ContactComponent } from '../componenets/contact/contact.component';
import { FooterComponent } from '../componenets/footer/footer.component';
import { HeaderComponent } from '../componenets/header/header.component';
import { HeroComponent } from '../componenets/hero/hero.component';
import { ProjectsComponent } from '../componenets/projects/projects.component';

@Component({
  selector: 'app-landing-page',
  imports: [
    HeaderComponent,
    HeroComponent,
    ContactComponent,
    FooterComponent,
    AboutComponent,
    ProjectsComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {}
