import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IngredientCategory, InventoryItem } from '../../interfaces/inventory';
import { SearchBar } from '../shared/search-bar/search-bar';
import { IngredientCard } from '../shared/ingredient-card/ingredient-card';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchBar, IngredientCard],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {
  private fb = inject(FormBuilder);
  private location = inject(Location);

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

  updateQuantity(item: InventoryItem, val: number) {
    if (!isNaN(val)) {
      this.inventoryItems.update(items =>
        items.map(i => i.id === item.id ? { ...i, quantity: val } : i)
      );
    }
  }

  updateUnit(item: InventoryItem, val: string) {
    this.inventoryItems.update(items =>
      items.map(i => i.id === item.id ? { ...i, unit: val } : i)
    );
  }

  updateExpiry(item: InventoryItem, val: string) {
    this.inventoryItems.update(items =>
      items.map(i => i.id === item.id ? { ...i, expiryDate: val } : i)
    );
  }

  goBack() {
    this.location.back();
  }
}

