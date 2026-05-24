import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar.service';
import { RecipeService, RecipeDTO } from '../../services/recipe.service';
import { RecipeCard } from '../shared/recipe-card/recipe-card';

const PAGE_SIZE = 16;

/** Maps URL segment → backend RecipeTag enum value */
const TAG_MAP: Record<string, string> = {
  'breakfast':      'BREAKFAST',
  'lunch':          'LUNCH',
  'dinner':         'DINNER',
  'dessert':        'DESSERT',
  'drinks':         'DRINK',
  'quick-easy':     'QUICK_EASY',
  'baking':         'BAKING',
  'mexican':        'MEXICAN',
  'italian':        'ITALIAN',
  'french':         'FRENCH',
  'spanish':        'SPANISH',
  'latin-american': 'LATIN_AMERICAN',
  'thai':           'THAI',
  'korean':         'KOREAN',
  'japanese':       'JAPANESE',
  'chinese':        'CHINESE',
  'indian':         'INDIAN',
  'soup':           'SOUP',
  'pasta':          'PASTA',
  'casserole':      'CASSEROLE',
  'spicy':          'SPICY',
  'bread':          'BREAD',
  'cookie':         'COOKIE',
  'salad':          'SALAD',
  'spring':         'SPRING',
  'summer':         'SUMMER',
  'fall':           'FALL',
  'winter':         'WINTER',
  'holiday':        'HOLIDAY',
};

/** Display labels for page hero */
const TAG_LABELS: Record<string, string> = {
  BREAKFAST:      'Breakfast & Brunch',
  LUNCH:          'Lunch',
  DINNER:         'Dinner',
  DESSERT:        'Desserts',
  DRINK:          'Drinks',
  QUICK_EASY:     'Quick & Easy',
  BAKING:         'Baking',
  MEXICAN:        'Mexican',
  ITALIAN:        'Italian',
  FRENCH:         'French',
  SPANISH:        'Spanish',
  LATIN_AMERICAN: 'Latin American',
  THAI:           'Thai',
  KOREAN:         'Korean',
  JAPANESE:       'Japanese',
  CHINESE:        'Chinese',
  INDIAN:         'Indian',
  SOUP:           'Soups',
  PASTA:          'Pasta',
  CASSEROLE:      'Casseroles',
  SPICY:          'Spicy',
  BREAD:          'Bread',
  COOKIE:         'Cookies',
  SALAD:          'Salads',
  SPRING:         'Spring',
  SUMMER:         'Summer',
  FALL:           'Fall',
  WINTER:         'Winter',
  HOLIDAY:        'Holiday',
};

@Component({
  selector: 'app-recipe-browse',
  standalone: true,
  imports: [CommonModule, RecipeCard],
  templateUrl: './recipe-browse.html',
  styleUrl: './recipe-browse.scss',
})
export class RecipeBrowse implements OnInit {
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sidebarService = inject(SidebarService);

  isSidebarExpanded = this.sidebarService.isExpanded;
  isLoading = signal(true);
  error = signal<string | null>(null);
  recipes = signal<RecipeDTO[]>([]);
  currentPage = signal(1);
  heroTitle = signal('Recipes');

  totalPages = computed(() => Math.max(1, Math.ceil(this.recipes().length / PAGE_SIZE)));
  paginatedRecipes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.recipes().slice(start, start + PAGE_SIZE);
  });

  ngOnInit() {
    // Static routes pass tag via route data; dynamic routes pass it as :tag param
    const data = this.route.snapshot.data;
    const params = this.route.snapshot.paramMap;

    let tag: string;
    if (data['tag']) {
      tag = data['tag'] as string;
    } else {
      const segment = params.get('tag') ?? '';
      tag = TAG_MAP[segment] ?? segment.toUpperCase().replace(/-/g, '_');
    }

    this.heroTitle.set(TAG_LABELS[tag] ?? tag);

    this.recipeService.getByTag(tag)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (recipes) => this.recipes.set(recipes),
        error: () => this.error.set('Failed to load recipes.'),
      });
  }

  viewRecipe(recipeId: number) {
    this.router.navigate(['/recipes', recipeId]);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
