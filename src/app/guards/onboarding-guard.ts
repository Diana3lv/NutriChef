import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';
import { STORAGE_KEYS } from '../constants/storage-keys';

export const onboardingGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const hasPendingOnboarding = sessionStorage.getItem(STORAGE_KEYS.pendingOnboarding) === 'true';

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  if (!hasPendingOnboarding) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
