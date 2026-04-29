import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint))) {
    return next(req);
  }

  const token = authService.getToken();
  
  const clonedRequest = token 
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
