import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const userGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.getToken()) {
    return of(router.createUrlTree(['/login']));
  }

  return authService.validateCurrentSession().pipe(
    map(isValid => {
      if (!isValid) {
        return router.createUrlTree(['/login']);
      }
      const user = authService.currentUser();
      if (user?.role === 'ADMIN') {
        return router.createUrlTree(['/home']);
      }
      return true;
    }),
    catchError(() => {
      authService.logout();
      return of(router.createUrlTree(['/login']));
    })
  );
};
