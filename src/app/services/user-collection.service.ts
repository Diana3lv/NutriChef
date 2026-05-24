import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecipeDTO } from './recipe.service';
import { API_BASE } from '../constants/api';

@Injectable({
  providedIn: 'root'
})
export class UserCollectionService {
  private http = inject(HttpClient);
  private readonly BASE = `${API_BASE}/api/users/collections`;


  getFavorites(): Observable<RecipeDTO[]> {
    return this.http.get<RecipeDTO[]>(`${this.BASE}/favorites`);
  }

  getFavoriteIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.BASE}/favorites/ids`);
  }

  addFavorite(recipeId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE}/favorites/${recipeId}`, null);
  }

  removeFavorite(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/favorites/${recipeId}`);
  }

  getDone(): Observable<RecipeDTO[]> {
    return this.http.get<RecipeDTO[]>(`${this.BASE}/done`);
  }

  getDoneIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.BASE}/done/ids`);
  }

  addDone(recipeId: number): Observable<void> {
    return this.http.post<void>(`${this.BASE}/done/${recipeId}`, null);
  }

  removeDone(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/done/${recipeId}`);
  }
}