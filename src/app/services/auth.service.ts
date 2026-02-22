import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';


export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}


@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';
  private readonly EXPIRY_KEY = 'authExpiry';

  currentUser = signal<User | null>(this.getUserFromStorage());
  isLoading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  login(credentials: LoginCredentials, rememberMe: boolean): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.setAuthExpiry(rememberMe);
        this.router.navigate(['/home']);
      }),
      catchError(error => this.handleError(error))
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
        this.setAuthExpiry(true); // Default 30 days for new users
        this.router.navigate(['/home']);
      }),
      catchError(error => this.handleError(error))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EXPIRY_KEY);
    this.currentUser.set(null);
    this.error.set(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null && !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.isLoading.set(false);
  }

  private setAuthExpiry(rememberMe: boolean): void {
    const days = rememberMe ? 30 : 1;
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem(this.EXPIRY_KEY, expiry.toString());
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    return null;
  }

  private checkAuthStatus(): void {
    const expiry = localStorage.getItem(this.EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.isLoading.set(false);
    
    let errorMessage = 'An error occurred';
    
    if (error.error?.error) {
      // Backend error message
      errorMessage = error.error.error;
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check if backend is running.';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 400) {
      errorMessage = error.error?.error || 'Invalid request';
    }
    
    this.error.set(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
