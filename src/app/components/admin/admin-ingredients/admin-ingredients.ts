import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Auth } from '../../../services/auth.service';
import { Location } from '@angular/common';
import {
  IngredientManagementService,
  IngredientWithSubstitutions,
  CreateIngredientRequest,
  SubstitutionAlternativeInput,
} from '../../../services/ingredient-management.service';
import { API_BASE } from '../../../constants/api';

@Component({
  selector: 'app-admin-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-ingredients.html',
  styleUrl: './admin-ingredients.scss',
})
export class AdminIngredients implements OnInit {
  private service = inject(IngredientManagementService);
  private authService = inject(Auth);
  private router = inject(Router);
  private location = inject(Location);
  private http = inject(HttpClient);

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');

  ingredients = signal<IngredientWithSubstitutions[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  tableSearchQuery = signal('');

  // Available allergens from backend enum
  availableAllergens = signal<{ value: string; label: string }[]>([]);

  // Add ingredient modal
  showAddIngredientModal = signal(false);

  // Add ingredient form
  newIngredient: Omit<CreateIngredientRequest, 'allergens'> & { category: string | null; foodGroup: string | null } = { name: '', unit: '', category: null, foodGroup: null };
  selectedAllergensList = signal<string[]>([]);

  // Food group search
  foodGroupQuery = signal('');
  showFoodGroupDropdown = signal(false);

  existingFoodGroups = computed(() => {
    const groups = new Set<string>();
    for (const ing of this.ingredients()) {
      if (ing.foodGroup) groups.add(ing.foodGroup);
    }
    return Array.from(groups).sort();
  });

  filteredFoodGroups = computed(() => {
    const q = this.foodGroupQuery().toLowerCase().trim();
    if (!q) return this.existingFoodGroups();
    return this.existingFoodGroups().filter(g => g.toLowerCase().includes(q));
  });

  // View substitutions modal
  viewingIngredientId = signal<number | null>(null);
  showAddSubForm = signal(false);

  viewingIngredient = computed(() => {
    const id = this.viewingIngredientId();
    return this.ingredients().find(i => i.id === id) ?? null;
  });

  // Add substitution modal
  editingIngredientId = signal<number | null>(null);
  selectedAlternatives = signal<Map<number, SubstitutionAlternativeInput>>(new Map());
  ingredientSearchQuery = signal('');
  searchFocused = signal(false);

  editingIngredient = computed(() => {
    const id = this.editingIngredientId();
    return this.ingredients().find(i => i.id === id);
  });

  availableAlts = computed(() => {
    const selectedId = this.viewingIngredientId() ?? this.editingIngredientId();
    return this.ingredients().filter(i => i.id !== selectedId);
  });

  filteredAvailableAlternatives = computed(() => {
    const query = this.ingredientSearchQuery().toLowerCase().trim();
    const all = this.availableAlts();
    if (!query) return [];
    return all.filter(i => i.name.toLowerCase().includes(query));
  });

  filteredTableIngredients = computed(() => {
    const query = this.tableSearchQuery().toLowerCase().trim();
    if (!query) return this.ingredients();
    return this.ingredients().filter(i => i.name.toLowerCase().includes(query));
  });

  goBack(): void {
    this.router.navigate(['/home']);
  }

  openAddIngredientModal(): void {
    this.showAddIngredientModal.set(true);
  }

  closeAddIngredientModal(): void {
    this.showAddIngredientModal.set(false);
    this.newIngredient = { name: '', unit: '', category: null, foodGroup: null };
    this.selectedAllergensList.set([]);
    this.foodGroupQuery.set('');
    this.showFoodGroupDropdown.set(false);
  }

  ngOnInit(): void {
    this.loadIngredients();
    this.loadAllergens();
  }

  loadAllergens(): void {
    this.http.get<{ value: string; label: string }[]>(`${API_BASE}/api/nutrition/preferences/allergens`)
      .subscribe({
        next: (list) => this.availableAllergens.set(list),
        error: () => { /* non-critical; fallback to empty */ }
      });
  }

  loadIngredients(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.ingredients.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load ingredients.');
        this.isLoading.set(false);
      },
    });
  }

  isAllergenSelected(value: string): boolean {
    return this.selectedAllergensList().includes(value);
  }

  toggleAllergen(value: string): void {
    const current = this.selectedAllergensList();
    if (current.includes(value)) {
      this.selectedAllergensList.set(current.filter(a => a !== value));
    } else {
      this.selectedAllergensList.set([...current, value]);
    }
  }

  onFoodGroupInput(value: string): void {
    this.foodGroupQuery.set(value);
    this.newIngredient.foodGroup = value.trim() || null;
    this.showFoodGroupDropdown.set(true);
  }

  onFoodGroupBlur(): void {
    setTimeout(() => this.showFoodGroupDropdown.set(false), 150);
  }

  selectFoodGroup(group: string): void {
    this.newIngredient.foodGroup = group;
    this.foodGroupQuery.set(group);
    this.showFoodGroupDropdown.set(false);
  }

  submitNewIngredient(): void {
    if (!this.newIngredient.name.trim() || !this.newIngredient.unit.trim()) {
      this.errorMessage.set('Name and unit are required.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.create({ ...this.newIngredient, allergens: this.selectedAllergensList() }).subscribe({
      next: (created) => {
        this.loadIngredients();
        this.closeAddIngredientModal();
        this.successMessage.set(`Ingredient "${created.name}" created successfully.`);
        this.clearMessageAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to create ingredient.');
        this.isLoading.set(false);
      },
    });
  }

  openViewSubstitutions(ingredientId: number): void {
    this.viewingIngredientId.set(ingredientId);
    this.showAddSubForm.set(false);
    this.selectedAlternatives.set(new Map());
  }

  closeViewSubstitutions(): void {
    this.viewingIngredientId.set(null);
    this.showAddSubForm.set(false);
    this.selectedAlternatives.set(new Map());
  }

  toggleAddSubForm(): void {
    this.showAddSubForm.update(v => !v);
    if (!this.showAddSubForm()) {
      this.selectedAlternatives.set(new Map());
    }
    this.ingredientSearchQuery.set('');
  }

  submitSubstitutionInline(): void {
    const ingredientId = this.viewingIngredientId();
    const alternatives = Array.from(this.selectedAlternatives().values());
    if (!ingredientId || alternatives.length === 0) {
      this.errorMessage.set('Select at least one alternative.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.addSubstitutionOption(ingredientId, alternatives).subscribe({
      next: (updated) => {
        this.ingredients.update(list =>
          list.map(i => (i.id === updated.id ? updated : i))
        );
        this.showAddSubForm.set(false);
        this.selectedAlternatives.set(new Map());
        this.successMessage.set('Substitution added successfully.');
        this.isLoading.set(false);
        this.clearMessageAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to add substitution option.');
        this.isLoading.set(false);
      },
    });
  }

  openEditSubstitutions(ingredientId: number): void {
    this.editingIngredientId.set(ingredientId);
    this.selectedAlternatives.set(new Map());
    this.ingredientSearchQuery.set('');
  }

  closeEditSubstitutions(): void {
    this.editingIngredientId.set(null);
    this.selectedAlternatives.set(new Map());
    this.ingredientSearchQuery.set('');
  }

  isAlternativeSelected(id: number): boolean {
    return this.selectedAlternatives().has(id);
  }

  toggleAlternative(id: number): void {
    const current = new Map(this.selectedAlternatives());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.set(id, {
        alternativeIngredientId: id,
        ratio: 1.0,
        description: null,
      });
    }
    this.selectedAlternatives.set(current);
  }

  updateRatio(id: number, ratio: number): void {
    const current = new Map(this.selectedAlternatives());
    const alt = current.get(id);
    if (alt) {
      alt.ratio = ratio || 1.0;
      current.set(id, alt);
    }
    this.selectedAlternatives.set(current);
  }

  updateDescription(id: number, description: string): void {
    const current = new Map(this.selectedAlternatives());
    const alt = current.get(id);
    if (alt) {
      alt.description = description.trim() || null;
      current.set(id, alt);
    }
    this.selectedAlternatives.set(current);
  }

  submitSubstitution(): void {
    const ingredientId = this.editingIngredientId();
    const alternatives = Array.from(this.selectedAlternatives().values());
    if (!ingredientId || alternatives.length === 0) {
      this.errorMessage.set('Select at least one alternative.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.addSubstitutionOption(ingredientId, alternatives).subscribe({
      next: (updated) => {
        this.ingredients.update(list =>
          list.map(i => (i.id === updated.id ? updated : i))
        );
        this.closeEditSubstitutions();
        this.successMessage.set('Substitution option added successfully.');
        this.isLoading.set(false);
        this.clearMessageAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to add substitution option.');
        this.isLoading.set(false);
      },
    });
  }

  deleteSubstitution(ingredientId: number, substitutionId: number): void {
    if (!confirm('Are you sure you want to delete this substitution option?')) {
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.service.deleteSubstitutionOption(ingredientId, substitutionId).subscribe({
      next: (updated) => {
        this.ingredients.update(list =>
          list.map(i => (i.id === updated.id ? updated : i))
        );
        this.successMessage.set('Substitution option deleted successfully.');
        this.isLoading.set(false);
        this.clearMessageAfterDelay();
      },
      error: () => {
        this.errorMessage.set('Failed to delete substitution option.');
        this.isLoading.set(false);
      },
    });
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}