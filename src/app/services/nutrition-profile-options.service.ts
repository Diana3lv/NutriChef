import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
export type { HealthOption } from '../interfaces/health-option';
import { HealthOption } from '../interfaces/health-option';
import { API_BASE } from '../constants/api';

@Injectable({
  providedIn: 'root'
})
export class NutritionProfileOptionsService {
  private allergensCache$: Observable<HealthOption[]> | null = null;
  private dietaryPreferencesCache$: Observable<HealthOption[]> | null = null;
  private http = inject(HttpClient);

  getAllergens(): Observable<HealthOption[]> {
    if (!this.allergensCache$) {
      this.allergensCache$ = this.http.get<HealthOption[]>(`${API_BASE}/api/nutrition/preferences/allergens`)
        .pipe(shareReplay(1));
    }
    return this.allergensCache$;
  }

  getDietaryPreferences(): Observable<HealthOption[]> {
    if (!this.dietaryPreferencesCache$) {
      this.dietaryPreferencesCache$ = this.http.get<HealthOption[]>(`${API_BASE}/api/nutrition/preferences/dietary-preferences`)
        .pipe(shareReplay(1));
    }
    return this.dietaryPreferencesCache$;
  }
}