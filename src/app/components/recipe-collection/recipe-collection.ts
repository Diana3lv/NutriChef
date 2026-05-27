import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar.service';
import { UserCollectionService } from '../../services/user-collection.service';
import { RecipeStatusService, UserRecipeStatusDTO } from '../../services/recipe-status.service';
import { RecipeCard } from '../shared/recipe-card/recipe-card';
import { RecipeDTO } from '../../services/recipe.service';

const PAGE_SIZE = 4;

type TabFilter = 'ALL' | 'IN_PROGRESS' | 'DONE';

@Component({
  selector: 'app-recipe-collection',
  standalone: true,
  imports: [CommonModule, RecipeCard],
  templateUrl: './recipe-collection.html',
  styleUrl: './recipe-collection.scss',
})
export class RecipeCollection implements OnInit {
  private sidebarService = inject(SidebarService);
  private collectionService = inject(UserCollectionService);
  private statusService = inject(RecipeStatusService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSidebarExpanded = this.sidebarService.isExpanded;
  isLoading = signal(true);
  error = signal<string | null>(null);
  recipes = signal<RecipeDTO[]>([]);
  currentPage = signal(1);

  // Set from route data
  collectionType!: 'FAVORITE' | 'DONE';
  heroTitle!: string;
  heroSubtitle!: string;
  emptyMessage!: string;

  // Tab filter (only for DONE/ALL view)
  activeTab = signal<TabFilter>('ALL');
  /** All combined statuses (IN_PROGRESS + DONE) for the tracked view */
  private allStatuses = signal<UserRecipeStatusDTO[]>([]);

  showTabs = false;

  filteredRecipes = computed(() => {
    if (!this.showTabs) return this.recipes();
    const tab = this.activeTab();
    return this.allStatuses()
      .filter(s => tab === 'ALL' || s.status === tab)
      .map(s => s.recipe!)
      .filter(r => !!r);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRecipes().length / PAGE_SIZE)));

  paginatedRecipes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.filteredRecipes().slice(start, start + PAGE_SIZE);
  });

  ngOnInit() {
    const data = this.route.snapshot.data;
    this.collectionType = data['collectionType'];

    if (this.collectionType === 'FAVORITE') {
      this.heroTitle = 'Your Favorite Recipes';
      this.heroSubtitle = "Recipes you've saved for later";
      this.emptyMessage = "You haven't saved any favorite recipes yet.";
      this.showTabs = false;

      this.collectionService.getFavorites()
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (recipes) => this.recipes.set(recipes),
          error: () => this.error.set('Failed to load recipes.')
        });
    } else {
      this.heroTitle = 'Track your culinary journey';
      this.heroSubtitle = "Recipes you've marked as in progress or as done";
      this.emptyMessage = "You haven't started any recipe yet.";
      this.showTabs = true;

      forkJoin({
        inProgress: this.statusService.getInProgress(),
        done: this.statusService.getDone()
      }).pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: ({ inProgress, done }) => {
          this.allStatuses.set([...inProgress, ...done]);
        },
        error: () => this.error.set('Failed to load recipes.')
      });
    }
  }

  setTab(tab: TabFilter) {
    this.activeTab.set(tab);
    this.currentPage.set(1);
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
