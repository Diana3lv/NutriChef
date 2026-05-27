import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../constants/api';

export interface UserAdmin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  recipesCreatedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly apiUrl = `${API_BASE}/api/admin/users`;
  private http = inject(HttpClient);

  getAllUsers(searchQuery?: string, roleFilter?: string): Observable<UserAdmin[]> {
    let params = new HttpParams();
    
    if (searchQuery && searchQuery.trim()) {
      params = params.set('search', searchQuery.trim());
    }
    
    if (roleFilter) {
      params = params.set('role', roleFilter);
    }

    return this.http.get<UserAdmin[]>(this.apiUrl, { params });
  }

  getUserDetails(userId: number): Observable<UserAdmin> {
    return this.http.get<UserAdmin>(`${this.apiUrl}/${userId}`);
  }

  updateUserRole(userId: number, newRole: string): Observable<UserAdmin> {
    let params = new HttpParams().set('newRole', newRole);
    return this.http.put<UserAdmin>(
      `${this.apiUrl}/${userId}/role`,
      {},
      { params }
    );
  }

  deactivateUser(userId: number): Observable<UserAdmin> {
    return this.http.put<UserAdmin>(
      `${this.apiUrl}/${userId}/deactivate`,
      {}
    );
  }

  reactivateUser(userId: number): Observable<UserAdmin> {
    return this.http.put<UserAdmin>(
      `${this.apiUrl}/${userId}/activate`,
      {}
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  getUserDisplayName(user: UserAdmin): string {
    return `${user.firstName} ${user.lastName}`;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'ADMIN':
        return '#d32f2f';
      case 'USER':
      default:
        return '#4caf50';
    }
  }
}
