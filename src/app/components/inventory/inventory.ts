import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IngredientCategory, InventoryItem } from '../../interfaces/inventory';
import { IngredientSuggestion, InventoryService } from '../../services/inventory.service';
import { SearchBar } from '../shared/search-bar/search-bar';
import { IngredientCard } from '../shared/ingredient-card/ingredient-card';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SearchBar, IngredientCard],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private inventoryService = inject(InventoryService);

  IngredientCategory = IngredientCategory;

  inventoryItems = signal<InventoryItem[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  showAddModal = signal(false);
  showDeleteModal = signal(false);
  editingItemId = signal<string | null>(null);
  itemToDelete = signal<InventoryItem | null>(null);

  addForm = this.fb.group({
    name: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(0)]],
    expiryDate: ['', Validators.required]
  });

  ingredientSuggestions = signal<IngredientSuggestion[]>([]);
  showSuggestions = signal(false);
  selectedUnit = signal<string>('');
  private nameSearch$ = new Subject<string>();

  ngOnInit() {
    this.nameSearch$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => this.inventoryService.searchIngredients(query))
    ).subscribe(results => {
      this.ingredientSuggestions.set(results);
      this.showSuggestions.set(results.length > 0);
    });

    this.inventoryService.getInventory().subscribe({
      next: (items) => {
        this.inventoryItems.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Failed to load inventory.');
        this.isLoading.set(false);
      }
    });
  }

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
    this.addForm.reset({ quantity: 0 });
    this.ingredientSuggestions.set([]);
    this.showSuggestions.set(false);
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
    this.showSuggestions.set(false);
    this.selectedUnit.set('');
  }

  onNameInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.nameSearch$.next(query);
  }

  selectIngredient(suggestion: IngredientSuggestion) {
    this.addForm.patchValue({ name: suggestion.name });
    this.selectedUnit.set(suggestion.unit ?? '');
    this.showSuggestions.set(false);
    this.ingredientSuggestions.set([]);
  }

  addItem() {
    if (this.addForm.valid) {
      const formVal = this.addForm.value;
      const newItem: InventoryItem = {
        id: '',
        name: formVal.name!,
        quantity: formVal.quantity!,
        unit: '',
        category: IngredientCategory.Other,
        expiryDate: formVal.expiryDate!
      };
      
      this.inventoryService.addItem(newItem).subscribe({
        next: (created) => {
          // The backend merges quantities when the ingredient already exists,
          // returning the updated existing item (same id). Use upsert to avoid
          // duplicate entries when track-by-id sees the same id twice.
          this.inventoryItems.update(items => {
            const idx = items.findIndex(i => i.id === created.id);
            if (idx >= 0) {
              const updated = [...items];
              updated[idx] = created;
              return updated;
            }
            return [...items, created];
          });
          this.closeAddModal();
        },
        error: () => this.error.set('Failed to add item.')
      });
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
      this.inventoryService.deleteItem(item.id).subscribe({
        next: () => {
          this.inventoryItems.update(items => items.filter(i => i.id !== item.id));
          this.closeDeleteModal();
        },
        error: () => this.error.set('Failed to delete item.')
      });
    }
  }

  startEdit(id: string) {
    this.editingItemId.set(id);
  }

  saveEdit(item: InventoryItem) {
    this.inventoryService.updateItem(item).subscribe({
      next: (updated) => {
        this.inventoryItems.update(items => items.map(i => i.id === updated.id ? updated : i));
        this.editingItemId.set(null);
      },
      error: () => this.error.set('Failed to update item.')
    });
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

