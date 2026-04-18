import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
export type { HealthOption } from '../interfaces/health-option';
import { HealthOption } from '../interfaces/health-option';

@Injectable({
  providedIn: 'root'
})
export class NutritionProfileOptionsService {
  private allergensCache$: Observable<HealthOption[]> | null = null;
  private dietaryPreferencesCache$: Observable<HealthOption[]> | null = null;

  constructor(private http: HttpClient) {}

  getAllergens(): Observable<HealthOption[]> {
    if (!this.allergensCache$) {
      this.allergensCache$ = this.http.get<HealthOption[]>('http://localhost:8080/api/nutrition/preferences/allergens')
        .pipe(shareReplay(1));
    }
    return this.allergensCache$;
  }

  getDietaryPreferences(): Observable<HealthOption[]> {
    if (!this.dietaryPreferencesCache$) {
      this.dietaryPreferencesCache$ = this.http.get<HealthOption[]>('http://localhost:8080/api/nutrition/preferences/dietary-preferences')
        .pipe(shareReplay(1));
    }
    return this.dietaryPreferencesCache$;
  }
}