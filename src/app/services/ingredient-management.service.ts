import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../constants/api';

export interface SubstitutionAlternativeInput {
  alternativeIngredientId: number;
  ratio: number;
  description: string | null;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  category?: string | null;
  allergens: string[];
  ratio?: number;
  description?: string | null;
  substitutions?: Substitution[];
}

export interface Substitution {
  id: number;
  alternatives: Ingredient[]; // Alternatives are full Ingredient objects with ratio/description
}

export interface SubstitutionAlternative extends Ingredient {
  // Alias for alternatives array items
}

export type IngredientWithSubstitutions = Ingredient;

export interface SimpleIngredient {
  id: number;
  name: string;
  unit: string;
  allergens: string[];
}

export interface CreateIngredientRequest {
  name: string;
  unit: string;
  allergens: string[];
  category?: string | null;
}

export interface UpdateIngredientRequest {
  category: string | null;
  unit: string;
  allergens: string[];
}

@Injectable({ providedIn: 'root' })
export class IngredientManagementService {
  private readonly API_URL = `${API_BASE}/api/ingredients`;
  private http = inject(HttpClient);

  getAll(): Observable<IngredientWithSubstitutions[]> {
    return this.http.get<IngredientWithSubstitutions[]>(this.API_URL);
  }

  getSimple(): Observable<SimpleIngredient[]> {
    return this.http.get<SimpleIngredient[]>(`${this.API_URL}/simple`);
  }

  create(ingredient: CreateIngredientRequest): Observable<IngredientWithSubstitutions> {
    return this.http.post<IngredientWithSubstitutions>(this.API_URL, ingredient);
  }

  update(id: number, data: UpdateIngredientRequest): Observable<IngredientWithSubstitutions> {
    return this.http.put<IngredientWithSubstitutions>(`${this.API_URL}/${id}`, data);
  }

  addSubstitutionOption(ingredientId: number, alternatives: SubstitutionAlternativeInput[]): Observable<IngredientWithSubstitutions> {
    return this.http.post<IngredientWithSubstitutions>(
      `${this.API_URL}/${ingredientId}/substitutions`,
      { alternatives }
    );
  }

  deleteSubstitutionOption(ingredientId: number, substitutionId: number): Observable<IngredientWithSubstitutions> {
    return this.http.delete<IngredientWithSubstitutions>(
      `${this.API_URL}/${ingredientId}/substitutions/${substitutionId}`
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
