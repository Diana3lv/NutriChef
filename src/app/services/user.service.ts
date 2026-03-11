import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UpdateProfileData, ChangePasswordData } from '../interfaces/user';


@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL = 'http://localhost:8080/api/users';
  private http = inject(HttpClient);

  updateProfile(data: UpdateProfileData): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/profile`, data);
  }

  changePassword(data: ChangePasswordData): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/password`, data);
  }
}
