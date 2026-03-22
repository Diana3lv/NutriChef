import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../interfaces/recipe';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/recipes';

  recipes = signal<Recipe[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  getAll(): Observable<Recipe[]> {
    return this.http.get<Recipe[]>(this.API_URL);
  }

  getById(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.API_URL}/${id}`);
  }

  create(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    return this.http.post<Recipe>(this.API_URL, recipe);
  }

  update(id: number, recipe: Partial<Recipe>): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.API_URL}/${id}`, recipe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
