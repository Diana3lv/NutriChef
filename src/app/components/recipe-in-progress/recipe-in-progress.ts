import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { SidebarService } from '../../services/sidebar.service';
import {
  RecipeStatusService,
  UserRecipeStatusDTO,
  SubmitFeedbackRequest,
  RecipeFeedbackDTO
} from '../../services/recipe-status.service';
import { FeedbackModal, MissingIngredient } from '../feedback-modal/feedback-modal';

const PAGE_SIZE = 16;

@Component({
  selector: 'app-recipe-in-progress',
  standalone: true,
  imports: [CommonModule, FeedbackModal],
  templateUrl: './recipe-in-progress.html',
  styleUrl: './recipe-in-progress.scss',
})
export class RecipeInProgress implements OnInit {
  private sidebarService = inject(SidebarService);
  private statusService = inject(RecipeStatusService);
  private router = inject(Router);

  isSidebarExpanded = this.sidebarService.isExpanded;
  isLoading = signal(true);
  error = signal<string | null>(null);
  items = signal<UserRecipeStatusDTO[]>([]);
  currentPage = signal(1);

  // Feedback modal state
  feedbackItem = signal<UserRecipeStatusDTO | null>(null);
  feedbackError = signal<string | null>(null);
  feedbackMissingIngredients = signal<MissingIngredient[] | null>(null);
  feedbackChecking = signal(false);
  showFeedbackModal = computed(() => this.feedbackItem() !== null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.items().length / PAGE_SIZE)));

  paginatedItems = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.items().slice(start, start + PAGE_SIZE);
  });

  ngOnInit() {
    this.statusService.getInProgress()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.items.set(data),
        error: () => this.error.set('Failed to load in-progress recipes.')
      });
  }

  viewRecipe(recipeId: number) {
    this.router.navigate(['/recipes', recipeId]);
  }

  openFeedbackModal(item: UserRecipeStatusDTO) {
    this.feedbackChecking.set(true);
    this.feedbackError.set(null);
    this.feedbackMissingIngredients.set(null);
    this.statusService.canComplete(item.recipeId).subscribe({
      next: () => {
        this.feedbackChecking.set(false);
        this.feedbackItem.set(item);
      },
      error: (err) => {
        this.feedbackChecking.set(false);
        const missing: MissingIngredient[] | undefined = err.error?.missingIngredients;
        if (missing?.length) {
          this.feedbackMissingIngredients.set(missing);
        } else {
          this.feedbackError.set(err.error?.message || 'Cannot complete recipe right now.');
        }
        this.feedbackItem.set(item); // open modal in error state
      }
    });
  }

  onFeedbackSubmitted(feedback: SubmitFeedbackRequest) {
    const item = this.feedbackItem();
    if (!item) return;
    this.statusService.markDone(item.recipeId, feedback).subscribe({
      next: () => {
        this.feedbackItem.set(null);
        this.feedbackError.set(null);
        this.items.update(list => list.filter(i => i.recipeId !== item.recipeId));
      },
      error: (err) => {
        // Extract error message from various response formats
        const errorMsg = err.error?.message || 
                        err.error || 
                        err.message || 
                        'Failed to mark recipe as done. Please try again.';
        this.feedbackError.set(errorMsg);
      }
    });
  }

  onFeedbackSkipped() {
    const item = this.feedbackItem();
    if (!item) return;
    this.statusService.markDone(item.recipeId, null).subscribe({
      next: () => {
        this.feedbackItem.set(null);
        this.feedbackError.set(null);
        this.items.update(list => list.filter(i => i.recipeId !== item.recipeId));
      },
      error: (err) => {
        // Extract error message from various response formats
        const errorMsg = err.error?.message || 
                        err.error || 
                        err.message || 
                        'Failed to mark recipe as done. Please try again.';
        this.feedbackError.set(errorMsg);
      }
    });
  }

  cancelItem(item: UserRecipeStatusDTO) {
    this.statusService.cancelInProgress(item.recipeId).subscribe({
      next: () => this.items.update(list => list.filter(i => i.recipeId !== item.recipeId))
    });
  }

  closeFeedbackModal() {
    this.feedbackItem.set(null);
    this.feedbackError.set(null);
    this.feedbackMissingIngredients.set(null);
  }

  getDifficultyClass(difficulty?: string): string {
    return difficulty?.toLowerCase() ?? '';
  }

  getExistingFeedback(): RecipeFeedbackDTO | null {
    return this.feedbackItem()?.feedback ?? null;
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
