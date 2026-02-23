import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: '',
    component: MainLayout,
    children: [
      { 
        path: 'home',
        component: Home,
        canActivate: [authGuard]
      }
    ]
  },
  { 
    path: 'login',
    component: Login,
  },
  { 
    path: 'register',
    component: Register,
  },
  { path: '**', redirectTo: 'home' }
];
