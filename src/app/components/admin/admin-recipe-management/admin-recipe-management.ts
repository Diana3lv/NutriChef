import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../../services/auth.service';
import { RecipeService, CreateRecipeRequest, RecipeDTO, RecipeIngredientDTO } from '../../../services/recipe.service';
import { IngredientManagementService, SimpleIngredient } from '../../../services/ingredient-management.service';

interface SelectedIngredient {
  ingredient: SimpleIngredient;
  quantity: string;
}

const AVAILABLE_TAGS = [
  { group: 'Meal Type', tags: [
    { value: 'BREAKFAST',  label: 'Breakfast & Brunch' },
    { value: 'LUNCH',      label: 'Lunch' },
    { value: 'DINNER',     label: 'Dinner' },
    { value: 'DESSERT',    label: 'Dessert' },
    { value: 'DRINK',      label: 'Drinks' },
    { value: 'QUICK_EASY', label: 'Quick & Easy' },
    { value: 'BAKING',     label: 'Baking' },
  ]},
  { group: 'Cuisine', tags: [
    { value: 'MEXICAN',        label: 'Mexican' },
    { value: 'ITALIAN',        label: 'Italian' },
    { value: 'FRENCH',         label: 'French' },
    { value: 'SPANISH',        label: 'Spanish' },
    { value: 'LATIN_AMERICAN', label: 'Latin American' },
    { value: 'THAI',           label: 'Thai' },
    { value: 'KOREAN',         label: 'Korean' },
    { value: 'JAPANESE',       label: 'Japanese' },
    { value: 'CHINESE',        label: 'Chinese' },
    { value: 'INDIAN',         label: 'Indian' },
  ]},
  { group: 'Popular', tags: [
    { value: 'SOUP',      label: 'Soup' },
    { value: 'PASTA',     label: 'Pasta' },
    { value: 'CASSEROLE', label: 'Casserole' },
    { value: 'SPICY',     label: 'Spicy' },
    { value: 'BREAD',     label: 'Bread' },
    { value: 'COOKIE',    label: 'Cookie' },
    { value: 'SALAD',     label: 'Salad' },
  ]},
  { group: 'Seasonal', tags: [
    { value: 'SPRING',  label: 'Spring' },
    { value: 'SUMMER',  label: 'Summer' },
    { value: 'FALL',    label: 'Fall' },
    { value: 'WINTER',  label: 'Winter' },
    { value: 'HOLIDAY', label: 'Holiday' },
  ]},
];

@Component({
  selector: 'app-admin-recipe-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-recipe-management.html',
  styleUrl: './admin-recipe-management.scss',
})
export class AdminRecipeManagement implements OnInit {
  private recipeService = inject(RecipeService);
  private ingredientService = inject(IngredientManagementService);
  private authService = inject(Auth);
  private router = inject(Router);

  // List view
  recipes = signal<RecipeDTO[]>([]);
  recipeSearchQuery = signal('');
  isLoadingRecipes = signal(false);
  showForm = signal(false);
  editingRecipeId = signal<number | null>(null);

  // Basic fields
  title = signal('');
  description = signal('');
  instructions = signal('');
  prepTimeMinutes = signal<number>(0);
  cookTimeMinutes = signal<number>(0);
  servings = signal<number>(1);
  difficulty = signal<'EASY' | 'MEDIUM' | 'HARD'>('EASY');

  // Image
  imageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  isUploadingImage = signal(false);

  // Ingredients
  allIngredients = signal<SimpleIngredient[]>([]);
  selectedIngredients = signal<SelectedIngredient[]>([]);
  ingredientSearch = signal('');

  // Tags
  readonly availableTags = AVAILABLE_TAGS;
  selectedTags = signal<string[]>([]);

  toggleTag(tag: string) {
    this.selectedTags.update(tags =>
      tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  filteredIngredients = computed(() => {
    const search = this.ingredientSearch().toLowerCase().trim();
    if (!search) return [];
    const selectedIds = new Set(this.selectedIngredients().map(si => si.ingredient.id));
    return this.allIngredients()
      .filter(i => !selectedIds.has(i.id) && i.name.toLowerCase().includes(search))
      .slice(0, 8);
  });

  filteredRecipes = computed(() => {
    const query = this.recipeSearchQuery().toLowerCase().trim();
    if (!query) return this.recipes();
    return this.recipes().filter(r => r.title.toLowerCase().includes(query));
  });

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal(false);

  ngOnInit() {
    this.ingredientService.getSimple().subscribe({
      next: (ingredients) => this.allIngredients.set(ingredients),
    });
    this.loadRecipes();
  }

  loadRecipes() {
    this.isLoadingRecipes.set(true);
    this.recipeService.getAll().subscribe({
      next: (data) => {
        this.recipes.set(data);
        this.isLoadingRecipes.set(false);
      },
      error: () => {
        this.isLoadingRecipes.set(false);
      },
    });
  }

  openCreateForm() {
    this.editingRecipeId.set(null);
    this.resetForm();
    this.showForm.set(true);
  }

  openEditForm(recipe: RecipeDTO) {
    this.editingRecipeId.set(recipe.id);
    this.title.set(recipe.title);
    this.description.set(recipe.description);
    this.instructions.set(recipe.instructions);
    this.prepTimeMinutes.set(recipe.prepTimeMinutes);
    this.cookTimeMinutes.set(recipe.cookTimeMinutes);
    this.servings.set(recipe.servings);
    this.difficulty.set(recipe.difficulty as 'EASY' | 'MEDIUM' | 'HARD');
    this.imagePreviewUrl.set(recipe.imageUrl ?? null);
    this.imageFile.set(null);
    this.selectedTags.set(recipe.tags ?? []);
    if (recipe.ingredients) {
      this.selectedIngredients.set(
        recipe.ingredients.map((ing: RecipeIngredientDTO) => {
          const foundIngredient = this.allIngredients().find(i => i.id === ing.ingredientId);
          return {
            ingredient: foundIngredient || { id: ing.ingredientId, name: ing.name, unit: ing.unit, allergens: (ing.allergens || []) as any[] },
            quantity: ing.quantity,
          };
        })
      );
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.resetForm();
    this.editingRecipeId.set(null);
  }

  deleteRecipe(id: number) {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.recipeService.delete(id).subscribe({
        next: () => {
          this.loadRecipes();
        },
        error: () => alert('Failed to delete recipe'),
      });
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.imagePreviewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  addIngredient(ingredient: SimpleIngredient) {
    this.selectedIngredients.update(list => [...list, { ingredient, quantity: '1' }]);
    this.ingredientSearch.set('');
  }

  removeIngredient(id: number) {
    this.selectedIngredients.update(list => list.filter(si => si.ingredient.id !== id));
  }

  updateQuantity(id: number, value: string) {
    this.selectedIngredients.update(list =>
      list.map(si => si.ingredient.id === id ? { ...si, quantity: value } : si)
    );
  }

  onSubmit() {
    if (!this.title().trim()) return;
    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    const doSave = (imageUrl: string | undefined) => {
      const request: CreateRecipeRequest = {
        title: this.title().trim(),
        description: this.description().trim(),
        instructions: this.instructions().trim(),
        prepTimeMinutes: this.prepTimeMinutes(),
        cookTimeMinutes: this.cookTimeMinutes(),
        servings: this.servings(),
        difficulty: this.difficulty(),
        imageUrl,
        tags: this.selectedTags(),
        ingredients: this.selectedIngredients().map(si => ({
          ingredientId: si.ingredient.id,
          quantity: si.quantity,
        })),
      };

      const operation = this.editingRecipeId() !== null
        ? this.recipeService.update(this.editingRecipeId()!, request)
        : this.recipeService.createAdmin(request);

      operation.subscribe({
        next: () => {
          this.submitSuccess.set(true);
          this.isSubmitting.set(false);
          setTimeout(() => {
            this.closeForm();
            this.loadRecipes();
          }, 500);
        },
        error: () => {
          this.submitError.set(this.editingRecipeId() ? 'Failed to update recipe. Please try again.' : 'Failed to create recipe. Please try again.');
          this.isSubmitting.set(false);
        },
      });
    };

    const file = this.imageFile();
    if (file) {
      this.isUploadingImage.set(true);
      this.recipeService.uploadRecipeImage(file).subscribe({
        next: (result) => {
          this.isUploadingImage.set(false);
          doSave(result.imageUrl);
        },
        error: () => {
          this.isUploadingImage.set(false);
          this.submitError.set('Failed to upload image.');
          this.isSubmitting.set(false);
        },
      });
    } else {
      doSave(this.imagePreviewUrl() || undefined);
    }
  }

  private resetForm() {
    this.title.set('');
    this.description.set('');
    this.instructions.set('');
    this.prepTimeMinutes.set(0);
    this.cookTimeMinutes.set(0);
    this.servings.set(1);
    this.difficulty.set('EASY');
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
    this.selectedIngredients.set([]);
    this.selectedTags.set([]);
    this.ingredientSearch.set('');
    this.submitSuccess.set(false);
    this.submitError.set(null);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}