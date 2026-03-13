import { Routes } from '@angular/router';

import { MainLayout } from './layouts/main-layout/main-layout';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Onboarding } from './components/onboarding/onboarding';
import { Profile } from './components/profile/profile';
import { Inventory } from './components/inventory/inventory';

import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { onboardingGuard } from './guards/onboarding-guard';

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
    path: '',
    component: MainLayout,
    children: [
      { 
        path: 'profile',
        component: Profile,
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '',
    component: MainLayout,
    children: [
      { 
        path: 'inventory',
        component: Inventory,
        canActivate: [authGuard]
      }
    ]
  },
  { 
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  { 
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'onboarding',
    component: Onboarding,
    canActivate: [onboardingGuard]
  },
  { path: '**', redirectTo: 'home' }
];
