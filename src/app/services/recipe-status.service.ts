import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../constants/api';
import { RecipeDTO } from './recipe.service';

export interface RecipeFeedbackDTO {
  rating: number;
  likedNotes?: string;
  improvementNotes?: string;
  updatedAt?: string;
}

export interface UserRecipeStatusDTO {
  recipeId: number;
  status: 'IN_PROGRESS' | 'DONE' | null;
  startedAt?: string;
  completedAt?: string;
  feedback?: RecipeFeedbackDTO;
  recipe?: RecipeDTO;
  cookCount?: number;
}

export interface SubmitFeedbackRequest {
  rating: number;
  likedNotes?: string;
  improvementNotes?: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeStatusService {
  private http = inject(HttpClient);
  private readonly API_URL = `${API_BASE}/api/users/recipes`;

  getStatus(recipeId: number): Observable<UserRecipeStatusDTO> {
    return this.http.get<UserRecipeStatusDTO>(`${this.API_URL}/${recipeId}/status`);
  }

  getInProgress(): Observable<UserRecipeStatusDTO[]> {
    return this.http.get<UserRecipeStatusDTO[]>(`${this.API_URL}/in-progress`);
  }

  getDone(): Observable<UserRecipeStatusDTO[]> {
    return this.http.get<UserRecipeStatusDTO[]>(`${this.API_URL}/done`);
  }

  markInProgress(recipeId: number): Observable<UserRecipeStatusDTO> {
    return this.http.post<UserRecipeStatusDTO>(`${this.API_URL}/${recipeId}/in-progress`, null);
  }

  cancelInProgress(recipeId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${recipeId}/in-progress`);
  }

  markDone(recipeId: number, feedback: SubmitFeedbackRequest | null): Observable<UserRecipeStatusDTO> {
    return this.http.post<UserRecipeStatusDTO>(`${this.API_URL}/${recipeId}/done`, feedback ?? {});
  }

  canComplete(recipeId: number): Observable<{ canComplete: boolean }> {
    return this.http.get<{ canComplete: boolean }>(`${this.API_URL}/${recipeId}/can-complete`);
  }
}
