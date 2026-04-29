import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Substitution {
  name: string;
  unit: string;
  allergens: string[];
  ratio: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientSubstitutionService {
  private apiUrl = '/api/ingredients';

  constructor(private http: HttpClient) {}

  getSubstitutions(ingredientId: number): Observable<Substitution[]> {
    return this.http.get<Substitution[]>(
      `${this.apiUrl}/${ingredientId}/substitutions`
    );
  }
}
