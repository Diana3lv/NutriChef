import { Component, inject, signal, computed, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
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

  // Filter panel state
  showFilterPanel = signal(false);
  filterInventoryOnly = signal(false);
  filterRequiredIngredients = signal<string[]>([]);
  filterDifficulty = signal<string[]>([]);
  filterMaxTime = signal(0);   // 0 = any
  ingredientFilterInput = signal('');
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
    const input = this.ingredientFilterInput().toLowerCase().trim();
    if (!input) return [];
    const selected = new Set(this.filterRequiredIngredients().map(n => n.toLowerCase()));
    return this.allIngredientNames()
      .filter(n => !selected.has(n.toLowerCase()) && n.toLowerCase().includes(input))
      .slice(0, 8);
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

  popularRecipes = computed(() => this.filteredRecipes().slice(0, 4));
  recommendedRecipes = computed(() => this.filteredRecipes().slice(4));

  private scrollListener?: () => void;

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
    this.showFilterPanel.set(!this.showFilterPanel());
  }

  toggleDifficulty(d: string): void {
    const cur = this.filterDifficulty();
    this.filterDifficulty.set(cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  }

  addRequiredIngredient(name: string): void {
    const cur = this.filterRequiredIngredients();
    if (!cur.includes(name)) this.filterRequiredIngredients.set([...cur, name]);
    this.ingredientFilterInput.set('');
  }

  removeRequiredIngredient(name: string): void {
    this.filterRequiredIngredients.update(arr => arr.filter(n => n !== name));
  }

  clearAllFilters(): void {
    this.filterInventoryOnly.set(false);
    this.filterRequiredIngredients.set([]);
    this.filterDifficulty.set([]);
    this.filterMaxTime.set(0);
    this.ingredientFilterInput.set('');
  }

  viewRecipe(recipeId: number): void {
    this.router.navigate(['/recipes', recipeId]);
  }
}
