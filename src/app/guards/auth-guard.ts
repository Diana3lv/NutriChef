import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  console.log("here");

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);

  return false;
};
