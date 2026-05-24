import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../constants/api';
import { Ingredient, Substitution } from './ingredient-management.service';

export type { Ingredient, Substitution };
export type SubstitutionAlternative = Ingredient; // Type alias

@Injectable({
  providedIn: 'root'
})
export class IngredientSubstitutionService {
  private readonly apiUrl = `${API_BASE}/api/ingredients`;
  private http = inject(HttpClient);

  getSubstitutions(ingredientId: number): Observable<Substitution[]> {
    return this.http.get<Substitution[]>(
      `${this.apiUrl}/${ingredientId}/substitutions`
    );
  }
}
