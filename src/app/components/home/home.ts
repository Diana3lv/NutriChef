import { Component, inject, signal, computed, effect, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RecipeDTO, RecipeService } from '../../services/recipe.service';
import { SidebarService } from '../../services/sidebar.service';
import { Auth } from '../../services/auth.service';
import { InventoryService } from '../../services/inventory.service';
import { InventoryItem } from '../../interfaces/inventory';
import { SearchBar } from '../shared/search-bar/search-bar';
import { RecipeCard } from '../shared/recipe-card/recipe-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBar, RecipeCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private sidebarService = inject(SidebarService);
  private recipeService = inject(RecipeService);
  private authService = inject(Auth);
  private inventoryService = inject(InventoryService);
  private router = inject(Router);

  isSidebarExpanded = this.sidebarService.isExpanded;
  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  heroTitle = computed(() => this.isAdmin()
    ? 'Administration Dashboard - Manage the NutriChef platform here'
    : 'Find your next delicious recipe to make today');

  showScrollIndicator = signal(true);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Source of truth for all loaded recipes
  allRecipes = signal<RecipeDTO[]>([]);

  // Live search query
  searchQuery = signal('');

  // Filter modal
  showFilterModal = signal(false);
  filterInventoryOnly = signal(false);
  filterRequiredIngredients = signal<string[]>([]);
  filterDifficulty = signal<string[]>([]);
  filterMaxTime = signal(0);   // 0 = any
  // Draft state (edits inside modal before committing)
  draftInventoryOnly = signal(false);
  draftRequiredIngredients = signal<string[]>([]);
  draftDifficulty = signal<string[]>([]);
  draftMaxTime = signal(0);
  draftIngredientInput = signal('');
  inventoryItems = signal<InventoryItem[]>([]);

  readonly maxTimeOptions = [
    { label: 'Any', value: 0 },
    { label: '≤ 30 min', value: 30 },
    { label: '≤ 60 min', value: 60 },
    { label: '≤ 90 min', value: 90 },
  ];
  readonly difficultyOptions = ['EASY', 'MEDIUM', 'HARD'];

  // All unique ingredient names from loaded recipes
  allIngredientNames = computed(() => {
    const names = new Set<string>();
    this.allRecipes().forEach(r => r.ingredients.forEach(i => names.add(i.name)));
    return Array.from(names).sort();
  });

  ingredientSuggestions = computed(() => {
    const input = this.draftIngredientInput().toLowerCase().trim();
    if (!input) return [];
    const selected = new Set(this.draftRequiredIngredients().map(n => n.toLowerCase()));
    return this.allIngredientNames()
      .filter(n => !selected.has(n.toLowerCase()) && n.toLowerCase().includes(input))
      .slice(0, 8);
  });

  draftActiveFilterCount = computed(() => {
    let count = 0;
    if (this.draftInventoryOnly()) count++;
    if (this.draftRequiredIngredients().length) count++;
    if (this.draftDifficulty().length) count++;
    if (this.draftMaxTime() > 0) count++;
    return count;
  });

  inventoryIngredientNames = computed(() =>
    new Set(this.inventoryItems().map(i => i.name.toLowerCase()))
  );

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterInventoryOnly()) count++;
    if (this.filterRequiredIngredients().length) count++;
    if (this.filterDifficulty().length) count++;
    if (this.filterMaxTime() > 0) count++;
    return count;
  });

  filteredRecipes = computed(() => {
    let recipes = this.allRecipes();
    const q = this.searchQuery().toLowerCase().trim();

    if (q) {
      recipes = recipes.filter(r =>
        r.title.toLowerCase().includes(q)
      );
    }
    if (this.filterInventoryOnly()) {
      const inv = this.inventoryIngredientNames();
      recipes = recipes.filter(r => r.ingredients.every(i => inv.has(i.name.toLowerCase())));
    }
    const required = this.filterRequiredIngredients();
    if (required.length) {
      recipes = recipes.filter(r => {
        const names = new Set(r.ingredients.map(i => i.name.toLowerCase()));
        return required.every(ri => names.has(ri.toLowerCase()));
      });
    }
    const diff = this.filterDifficulty();
    if (diff.length) recipes = recipes.filter(r => diff.includes(r.difficulty));

    const maxTime = this.filterMaxTime();
    if (maxTime > 0) recipes = recipes.filter(r => (r.prepTimeMinutes + r.cookTimeMinutes) <= maxTime);

    return recipes;
  });

  // Admin pagination
  readonly ADMIN_PAGE_SIZE = 12;
  adminPage = signal(1);
  adminTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecipes().length / this.ADMIN_PAGE_SIZE)));
  adminPaginatedRecipes = computed(() => {
    const start = (this.adminPage() - 1) * this.ADMIN_PAGE_SIZE;
    return this.filteredRecipes().slice(start, start + this.ADMIN_PAGE_SIZE);
  });

  // User row pagination
  readonly USER_ROW_SIZE = 4;
  popularPage = signal(1);
  recommendedPage = signal(1);
  popularRecipes = computed(() => {
    if (this.isAdmin()) return this.adminPaginatedRecipes();
    const all = this.filteredRecipes();
    const start = (this.popularPage() - 1) * this.USER_ROW_SIZE;
    return all.slice(start, start + this.USER_ROW_SIZE);
  });
  popularTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecipes().length / this.USER_ROW_SIZE)));
  recommendedRecipes = computed(() => {
    const all = this.filteredRecipes();
    const start = (this.recommendedPage() - 1) * this.USER_ROW_SIZE;
    return all.slice(start, start + this.USER_ROW_SIZE);
  });
  recommendedTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecipes().length / this.USER_ROW_SIZE)));

  private scrollListener?: () => void;

  constructor() {
    effect(() => {
      this.filteredRecipes();
      this.adminPage.set(1);
      this.popularPage.set(1);
      this.recommendedPage.set(1);
    });
  }

  adminPrevPage() { if (this.adminPage() > 1) this.adminPage.update(p => p - 1); }
  adminNextPage() { if (this.adminPage() < this.adminTotalPages()) this.adminPage.update(p => p + 1); }
  popularPrev() { if (this.popularPage() > 1) this.popularPage.update(p => p - 1); }
  popularNext() { if (this.popularPage() < this.popularTotalPages()) this.popularPage.update(p => p + 1); }
  recommendedPrev() { if (this.recommendedPage() > 1) this.recommendedPage.update(p => p - 1); }
  recommendedNext() { if (this.recommendedPage() < this.recommendedTotalPages()) this.recommendedPage.update(p => p + 1); }

  ngOnInit() {
    this.recipeService.getPersonalized().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (recipes) => this.allRecipes.set(recipes),
      error: () => this.error.set('Failed to load recipes. Please try again later.')
    });

    if (!this.isAdmin()) {
      this.inventoryService.getInventory().subscribe({
        next: (items) => this.inventoryItems.set(items),
        error: () => {}
      });
    }
  }

  ngAfterViewInit() {
    const contentWrapper = document.querySelector('.content-wrapper');
    if (contentWrapper) {
      this.scrollListener = () => {
        this.showScrollIndicator.set(contentWrapper.scrollTop === 0);
      };
      contentWrapper.addEventListener('scroll', this.scrollListener);
    }
  }

  ngOnDestroy() {
    if (this.scrollListener) {
      const contentWrapper = document.querySelector('.content-wrapper');
      contentWrapper?.removeEventListener('scroll', this.scrollListener);
    }
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onFilterOpen(): void {
    // Copy applied filters → draft so user sees current selections
    this.draftInventoryOnly.set(this.filterInventoryOnly());
    this.draftDifficulty.set([...this.filterDifficulty()]);
    this.draftMaxTime.set(this.filterMaxTime());
    this.draftRequiredIngredients.set([...this.filterRequiredIngredients()]);
    this.draftIngredientInput.set('');
    this.showFilterModal.set(true);
  }

  applyFilters(): void {
    this.filterInventoryOnly.set(this.draftInventoryOnly());
    this.filterDifficulty.set([...this.draftDifficulty()]);
    this.filterMaxTime.set(this.draftMaxTime());
    this.filterRequiredIngredients.set([...this.draftRequiredIngredients()]);
    this.showFilterModal.set(false);
  }

  cancelFilters(): void {
    this.showFilterModal.set(false);
  }

  toggleDraftDifficulty(d: string): void {
    const cur = this.draftDifficulty();
    this.draftDifficulty.set(cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  }

  addDraftIngredient(name: string): void {
    const cur = this.draftRequiredIngredients();
    if (!cur.includes(name)) this.draftRequiredIngredients.set([...cur, name]);
    this.draftIngredientInput.set('');
  }

  removeDraftIngredient(name: string): void {
    this.draftRequiredIngredients.update(arr => arr.filter(n => n !== name));
  }

  clearDraftFilters(): void {
    this.draftInventoryOnly.set(false);
    this.draftDifficulty.set([]);
    this.draftMaxTime.set(0);
    this.draftRequiredIngredients.set([]);
    this.draftIngredientInput.set('');
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipes', recipeId]);
  }
}
