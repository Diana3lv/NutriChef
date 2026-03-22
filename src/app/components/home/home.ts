import { Component, inject, signal, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Recipe } from '../../interfaces/recipe';
import { SidebarService } from '../../services/sidebar.service';
import { SearchBar } from '../shared/search-bar/search-bar';
import { RecipeCard } from '../shared/recipe-card/recipe-card';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SearchBar, RecipeCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  private sidebarService = inject(SidebarService);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  
  isSidebarExpanded = this.sidebarService.isExpanded;
  showScrollIndicator = signal(true);
  
  isLoading = signal(true);
  error = signal<string | null>(null);

  popularRecipes: Recipe[] = [];
  recommendedRecipes: Recipe[] = [];

  private scrollListener?: () => void;

  ngOnInit() {
    this.recipeService.getAll().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (recipes) => {
        // Todo: Implement real logic to determine popular and recommended recipes
        this.popularRecipes = recipes.slice(0, 4);
        this.recommendedRecipes = recipes.slice(4);
      },
      error: (err) => {
        console.error('Failed to load recipes', err);
        this.error.set('Failed to load recipes. Please try again later.');
      }
    });
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
      if (contentWrapper) {
        contentWrapper.removeEventListener('scroll', this.scrollListener);
      }
    }
  }

  onFilterOpen(): void {
    // TODO: implement filtering functionality
  }

  onSearch(query: string): void {
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  }

  viewRecipe(recipeId: number) {
    this.router.navigate(['/recipes', recipeId]);
  }
}
