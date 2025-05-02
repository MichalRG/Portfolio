import { Routes } from '@angular/router';
import { LandingPageComponent } from './componenets/landing-page/landing-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'animations',
    loadComponent: () =>
      import('./componenets/animations-page/animations-page.component').then(
        (m) => m.AnimationsPageComponent,
      ),
  },
  {
    path: 'layouts',
    loadComponent: () =>
      import(
        './componenets/layout-playground-page/layout-playground-page.component'
      ).then((m) => m.LayoutPlaygroundPageComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./componenets/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./componenets/admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
