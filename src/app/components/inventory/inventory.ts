import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientCategory, InventoryItem } from '../../interfaces/inventory';
import { SearchBar } from '../shared/search-bar/search-bar';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchBar],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  private fb = inject(FormBuilder);

  IngredientCategory = IngredientCategory;

  // Mock inventory data
  inventoryItems = signal<InventoryItem[]>([
    { id: '1', name: 'Carrots', quantity: 500, unit: 'g', category: IngredientCategory.Vegetables, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0] },
    { id: '2', name: 'Milk', quantity: 1, unit: 'L', category: IngredientCategory.Dairy, expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] },
    { id: '3', name: 'Chicken Breast', quantity: 2, unit: 'kg', category: IngredientCategory.Meat, expiryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0] }
  ]);
  searchQuery = signal('');
  showAddModal = signal(false);
  showDeleteModal = signal(false);
  editingItemId = signal<string | null>(null);
  itemToDelete = signal<InventoryItem | null>(null);

  addForm = this.fb.group({
    name: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    unit: ['g', Validators.required],
    category: ['Other', Validators.required],
    expiryDate: ['', Validators.required]
  });

  filteredItems = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.inventoryItems().filter(item => 
      item.name.toLowerCase().includes(query)
    );
  });

  filteredCategories = computed(() => {
    const items = this.filteredItems();
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || IngredientCategory.Other;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, InventoryItem[]>);

    return Object.entries(grouped).map(([name, items]) => ({
      name,
      items
    }));
  });

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  openAddModal() {
    this.addForm.reset({ unit: 'g', category: 'Other', quantity: 0 });
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }

  addItem() {
    if (this.addForm.valid) {
      const formVal = this.addForm.value;
      const newItem: InventoryItem = {
        id: crypto.randomUUID(),
        name: formVal.name!,
        quantity: formVal.quantity!,
        unit: formVal.unit!,
        category: formVal.category as IngredientCategory,
        expiryDate: formVal.expiryDate!
      };
      
      this.inventoryItems.update(items => [...items, newItem]);
      this.closeAddModal();
    }
  }

  openDeleteModal(item: InventoryItem) {
    this.itemToDelete.set(item);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete() {
    const item = this.itemToDelete();
    if (item) {
      this.inventoryItems.update(items => items.filter(i => i.id !== item.id));
      this.closeDeleteModal();
    }
  }

  startEdit(id: string) {
    this.editingItemId.set(id);
  }

  saveEdit(item: InventoryItem) {
    this.inventoryItems.update(items => 
      items.map(i => i.id === item.id ? { ...item } : i)
    );
    this.editingItemId.set(null);
  }

  updateQuantity(item: InventoryItem, event: Event) {
    const val = parseFloat((event.target as HTMLInputElement).value);
    if (!isNaN(val)) item.quantity = val;
  }

  updateUnit(item: InventoryItem, event: Event) {
    item.unit = (event.target as HTMLSelectElement).value;
  }

  updateExpiry(item: InventoryItem, event: Event) {
    item.expiryDate = (event.target as HTMLInputElement).value;
  }

  // Helper methods
  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  isExpiringSoon(date: string): boolean {
    const diff = new Date(date).getTime() - Date.now();
    // Check if expiring within 3 days (positive diff means future date)
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; 
  }

  getExpiryClass(date: string): string {
    if (this.isExpired(date)) return 'expired';
    if (this.isExpiringSoon(date)) return 'soon';
    return 'ok';
  }

  getExpiryLabel(date: string): string {
    const d = new Date(date);
    const now = new Date();
    // Reset time components for accurate day calculation
    d.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    if (d < now) return 'Expired';
    
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days left`;
    
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
}
