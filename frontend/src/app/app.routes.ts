import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'animations',
    loadComponent: () =>
      import('./components/animations-page/animations-page.component').then(
        (m) => m.AnimationsPageComponent,
      ),
  },
  {
    path: 'layouts',
    loadComponent: () =>
      import(
        './components/layout-playground-page/layout-playground-page.component'
      ).then((m) => m.LayoutPlaygroundPageComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./components/blog-page/blog-page.component').then(
        (m) => m.BlogPageComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login-page/login-page.component').then(
        (m) => m.LoginPageComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin-page/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
