import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IngredientCategory, InventoryIngredientDTO, InventoryItem } from '../interfaces/inventory';
import { API_BASE } from '../constants/api';

export interface IngredientSuggestion {
  id: number;
  name: string;
  unit: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private http = inject(HttpClient);
  private readonly BASE = `${API_BASE}/api/users/inventory`;

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<InventoryIngredientDTO[]>(this.BASE).pipe(
      map(dtos => dtos.map(this.toInventoryItem))
    );
  }

  addItem(item: InventoryItem): Observable<InventoryItem> {
    return this.http.post<InventoryIngredientDTO>(this.BASE, this.toDTO(item)).pipe(
      map(this.toInventoryItem)
    );
  }

  updateItem(item: InventoryItem): Observable<InventoryItem> {
    return this.http.put<InventoryIngredientDTO>(`${this.BASE}/${item.id}`, this.toDTO(item)).pipe(
      map(this.toInventoryItem)
    );
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete(`${this.BASE}/${id}`, { responseType: 'text' }).pipe(map(() => undefined as void));
  }

  clearExpired(): Observable<string> {
    return this.http.post<string>(`${this.BASE}/expired/clear`, null);
  }

  searchIngredients(query: string): Observable<IngredientSuggestion[]> {
    return this.http.get<IngredientSuggestion[]>(`${API_BASE}/api/ingredients/simple`).pipe(
      map(items => query.trim()
        ? items.filter(i => i.name.toLowerCase().includes(query.toLowerCase().trim()))
        : []
      )
    );
  }

  private toInventoryItem(dto: InventoryIngredientDTO): InventoryItem {
    const cat = dto.ingredient?.category;
    const category = cat && Object.values(IngredientCategory).includes(cat as IngredientCategory)
      ? (cat as IngredientCategory)
      : IngredientCategory.Other;

    return {
      id: String(dto.id ?? ''),
      name: dto.ingredient?.name ?? '',
      quantity: parseFloat(dto.quantity) || 0,
      unit: dto.ingredient?.unit ?? '',
      category,
      expiryDate: dto.expiryDate ?? ''
    };
  }

  private toDTO(item: InventoryItem): InventoryIngredientDTO {
    return {
      id: item.id ? Number(item.id) : undefined,
      ingredient: {
        name: item.name,
        category: item.category
      },
      quantity: String(item.quantity),
      expiryDate: item.expiryDate || undefined
    };
  }
}