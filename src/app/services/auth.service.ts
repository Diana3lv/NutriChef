import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

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

@Injectable({
  providedIn: 'root',
})
export class Auth {
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  constructor(private router: Router) {
    this.checkAuthStatus();
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }
  
  login(credentials: LoginCredentials, rememberMe: boolean): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validations
        if (!credentials.email || !credentials.password) {
          this.error.set('Email and password are required');
          this.isLoading.set(false);
          resolve(false);
          return;
        }
        
        if (!this.isValidEmail(credentials.email)) {
          this.error.set('Invalid email format');
          this.isLoading.set(false);
          resolve(false);
          return;
        }
        
        // Mock login success
        const mockUser: User = {
          id: Math.floor(Math.random() * 1000),
          email: credentials.email,
          firstName: credentials.email.split('@')[0],
          lastName: 'MockUser',
          role: 'USER'
        };
        
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        this.currentUser.set(mockUser);

        if (rememberMe) {
          const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
          localStorage.setItem('authExpiry', expiry.toString());
        } else {
          const expiry = Date.now() + (24 * 60 * 60 * 1000); // 1 day
          localStorage.setItem('authExpiry', expiry.toString());
        }

        this.router.navigate(['/home']);
        this.isLoading.set(false);
        resolve(true);
      }, 1000);
    });
  }
  
  register(data: RegisterData): Promise<boolean> {
    this.isLoading.set(true);
    this.error.set(null);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validations
        if (!data.email || !data.password || !data.firstName || !data.lastName) {
          this.error.set('All fields are required');
          this.isLoading.set(false);
          resolve(false);
          return;
        }
        
        if (!this.isValidEmail(data.email)) {
          this.error.set('Invalid email format');
          this.isLoading.set(false);
          resolve(false);
          return;
        }
        
        if (!this.isValidPassword(data.password)) {
          this.error.set('Password must be at least 8 characters and include uppercase, lowercase, number, and special character');
          this.isLoading.set(false);
          resolve(false);
          return;
        }
        
        // Mock register success
        const mockUser: User = {
          id: Math.floor(Math.random() * 1000),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'USER'
        };

        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        this.currentUser.set(mockUser);
        
        // Set auth expiry (default to 30 days for new registrations)
        const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days
        localStorage.setItem('authExpiry', expiry.toString());
        
        this.router.navigate(['/home']);
        this.isLoading.set(false);
        resolve(true);
      }, 1000);
    });
  }
  
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authExpiry');
    this.currentUser.set(null);
    this.error.set(null);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }
  
  private checkAuthStatus() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('currentUser');
      }
    }

    const expiry = localStorage.getItem('authExpiry');
    if (expiry && Date.now() > parseInt(expiry)) {
      this.logout();
    }
  }
}
