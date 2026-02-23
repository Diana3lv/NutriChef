import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth.service';

const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (AUTH_ENDPOINTS.some(endpoint => req.url.includes(endpoint))) {
    return next(req);
  }

  const token = inject(Auth).getToken();
  
  return next(
    token 
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req
  );
};
