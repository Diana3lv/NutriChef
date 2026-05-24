import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../constants/api';

export interface ShoppingListItem {
  id?: number;
  ingredientId: number;
  ingredientName: string;
  category?: string;
  quantity: number;
  unit: string;
  isPurchased: boolean;
  dateAdded?: string;
  notes?: string;
  isChecked?: boolean;
  ownQuantity?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private readonly apiUrl = `${API_BASE}/api/users/shopping-list`;
  private http = inject(HttpClient);

  getShoppingList(): Observable<ShoppingListItem[]> {
    return this.http.get<ShoppingListItem[]>(this.apiUrl);
  }

  addRecipeIngredientsToList(recipeId: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/recipe/${recipeId}`,
      {},
      { responseType: 'text' }
    );
  }

  addItem(
    ingredientId: number,
    quantity: number,
    notes?: string
  ): Observable<ShoppingListItem> {
    let params = new HttpParams()
      .set('ingredientId', ingredientId.toString())
      .set('quantity', quantity.toString());
    
    if (notes) {
      params = params.set('notes', notes);
    }

    return this.http.post<ShoppingListItem>(this.apiUrl, {}, { params });
  }

  removeItem(ingredientId: number): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/${ingredientId}`
    );
  }

  markAsPurchased(itemId: number): Observable<string> {
    return this.http.put<string>(
      `${this.apiUrl}/${itemId}/purchased`,
      {}
    );
  }

  clearPurchased(): Observable<string> {
    return this.http.delete<string>(
      `${this.apiUrl}/purchased`
    );
  }

  batchDeleteItems(ingredientIds: number[]): Observable<void> {
    return this.http.delete(`${this.apiUrl}/batch`, {
      body: ingredientIds,
      responseType: 'text',
    }).pipe(map(() => undefined as void));
  }

  updateItemQuantity(itemId: number, quantity: number): Observable<ShoppingListItem> {
    return this.http.put<ShoppingListItem>(`${this.apiUrl}/${itemId}/quantity`, quantity);
  }

  toggleChecked(itemId: number): Observable<ShoppingListItem> {
    return this.http.put<ShoppingListItem>(`${this.apiUrl}/${itemId}/checked`, {});
  }

  reduceOwnQuantity(itemId: number, amount: number): Observable<ShoppingListItem | null> {
    return this.http.put<ShoppingListItem | null>(
      `${this.apiUrl}/${itemId}/own-quantity`,
      null,
      { params: new HttpParams().set('amount', amount.toString()) }
    );
  }

  groupByCategory(items: ShoppingListItem[]): Map<string, ShoppingListItem[]> {    const grouped = new Map<string, ShoppingListItem[]>();
    
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(item);
    });

    return new Map([...grouped.entries()].sort());
  }
}