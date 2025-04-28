import { Routes } from '@angular/router';
import { AnimationsPageComponent } from './animations-page/animations-page.component';
import { LandingPageComponent } from './landing-page/landing-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'animations', component: AnimationsPageComponent },
];
