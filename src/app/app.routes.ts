import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./componenets/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent,
      ),
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
    path: '**',
    redirectTo: '',
  },
];
