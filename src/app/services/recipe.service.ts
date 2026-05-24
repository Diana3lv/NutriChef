import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recipe } from '../interfaces/recipe';
import { API_BASE } from '../constants/api';

export interface CreateRecipeRequest {
  title: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  tags?: string[];
  ingredients: { ingredientId: number; quantity: string }[];
}

export interface RecipeIngredientDTO {
  ingredientId: number;
  name: string;
  quantity: string;
  unit: string;
  allergens: string[];
}

export interface RecipeDTO {
  id: number;
  title: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl?: string;
  sourceUrl?: string;
  sourceApi?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  ingredients: RecipeIngredientDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_BASE}/recipes`;
  private readonly BASE_URL = API_BASE;

  recipes = signal<Recipe[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  getAll(): Observable<RecipeDTO[]> {
    return this.http.get<RecipeDTO[]>(this.API_URL).pipe(
      map(recipes => recipes.map(r => this.ensureFullImageUrl(r)))
    );
  }

  search(query: string): Observable<RecipeDTO[]> {
    const params = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.http.get<RecipeDTO[]>(`${this.API_URL}/search${params}`).pipe(
      map(recipes => recipes.map(r => this.ensureFullImageUrl(r)))
    );
  }

  getPersonalized(): Observable<RecipeDTO[]> {
    return this.http.get<RecipeDTO[]>(`${this.API_URL}/personalized`).pipe(
      map(recipes => recipes.map(r => this.ensureFullImageUrl(r)))
    );
  }

  getByTag(tag: string): Observable<RecipeDTO[]> {
    return this.http.get<RecipeDTO[]>(`${this.API_URL}/tag/${encodeURIComponent(tag)}`).pipe(
      map(recipes => recipes.map(r => this.ensureFullImageUrl(r)))
    );
  }

  getById(id: number): Observable<RecipeDTO> {
    return this.http.get<RecipeDTO>(`${this.API_URL}/${id}`).pipe(
      map(recipe => this.ensureFullImageUrl(recipe))
    );
  }

  create(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Observable<Recipe> {
    return this.http.post<Recipe>(this.API_URL, recipe);
  }

  update(id: number, request: CreateRecipeRequest): Observable<RecipeDTO> {
    return this.http.put<RecipeDTO>(`${this.API_URL}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  createAdmin(request: CreateRecipeRequest): Observable<RecipeDTO> {
    return this.http.post<RecipeDTO>(this.API_URL, request);
  }

  uploadRecipeImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.API_URL}/images`, formData).pipe(
      map(response => ({
        imageUrl: this.BASE_URL + response.imageUrl
      }))
    );
  }

  private ensureFullImageUrl(recipe: RecipeDTO): RecipeDTO {
    if (recipe.imageUrl && !recipe.imageUrl.startsWith('http')) {
      recipe.imageUrl = this.BASE_URL + recipe.imageUrl;
    }
    return recipe;
  }
}
