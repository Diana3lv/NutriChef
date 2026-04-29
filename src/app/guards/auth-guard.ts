import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(Auth);
  const router = inject(Router);

  // If there's no token, don't even bother calling the backend.
  if (!authService.getToken()) {
    return of(router.createUrlTree(['/login']));
  }

  // If there is a token, validate it with the backend.
  return authService.validateCurrentSession().pipe(
    map(isValid => {
      // If the session is valid, allow access.
      if (isValid) {
        return true;
      }
      // If the session is not valid (the service returned false), redirect to login.
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      // If the observable errors for any reason, deny access and redirect.
      authService.logout();
      return of(router.createUrlTree(['/login']));
    })
  );
};
