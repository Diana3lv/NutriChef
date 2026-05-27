import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { UserCollectionService } from '../../services/user-collection.service';
import {
  RecipeStatusService,
  UserRecipeStatusDTO,
  SubmitFeedbackRequest,
  RecipeFeedbackDTO
} from '../../services/recipe-status.service';
import { FeedbackModal, MissingIngredient } from '../feedback-modal/feedback-modal';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, FeedbackModal],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private collectionService = inject(UserCollectionService);
  private statusService = inject(RecipeStatusService);
  private location = inject(Location);

  recipe = signal<any | null>(null);
  isFavorite = signal(false);
  isLoading = signal(true);
  descriptionExpanded = signal(false);
  descriptionOverflows = signal(false);

  @ViewChild('descEl') descEl?: ElementRef<HTMLParagraphElement>;

  constructor() {
    effect(() => {
      const r = this.recipe();
      if (r?.description) {
        setTimeout(() => {
          const el = this.descEl?.nativeElement;
          if (el) {
            this.descriptionOverflows.set(el.scrollHeight > el.clientHeight + 1);
          }
        }, 50);
      } else {
        this.descriptionOverflows.set(false);
      }
    });
  }
  error = signal<string | null>(null);

  // Recipe cooking status
  recipeStatus = signal<UserRecipeStatusDTO | null>(null);
  showFeedbackModal = signal(false);
  feedbackError = signal<string | null>(null);
  feedbackMissingIngredients = signal<MissingIngredient[] | null>(null);
  statusActionLoading = signal(false);
  statusActionError = signal<string | null>(null);

  status = computed(() => this.recipeStatus()?.status ?? null);
  existingFeedback = computed<RecipeFeedbackDTO | null>(() => this.recipeStatus()?.feedback ?? null);

  parsedSteps = computed(() => {
    const instructions = this.recipe()?.instructions ?? '';
    return instructions
      .split(/\n|(?=\d+\.)/)
      .map((s: string) => s.replace(/^\d+\.\s*/, '').trim())
      .filter((s: string) => s.length > 0);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(Number(id));
      this.loadCollectionState(Number(id));
      this.loadStatus(Number(id));
    } else {
      this.error.set('Recipe ID not found');
      this.isLoading.set(false);
    }
  }

  private loadRecipe(id: number) {
    this.recipeService.getById(id).subscribe({
      next: (data) => {
        this.recipe.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load recipe');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  private loadCollectionState(recipeId: number) {
    this.collectionService.getFavoriteIds().subscribe({
      next: (ids) => this.isFavorite.set(ids.includes(recipeId))
    });
  }

  private loadStatus(recipeId: number) {
    this.statusService.getStatus(recipeId).subscribe({
      next: (dto) => this.recipeStatus.set(dto),
      error: () => { /* non-fatal */ }
    });
  }

  getDifficultyClass(): string {
    return this.recipe()?.difficulty?.toLowerCase() ?? '';
  }

  getTotalTime(): number {
    const recipe = this.recipe();
    if (!recipe) return 0;
    return (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  }

  toggleFavorite() {
    const recipeId = this.recipe()?.id;
    if (!recipeId) return;
    if (this.isFavorite()) {
      this.collectionService.removeFavorite(recipeId).subscribe();
      this.isFavorite.set(false);
    } else {
      this.collectionService.addFavorite(recipeId).subscribe();
      this.isFavorite.set(true);
    }
  }

  toggleDescription() {
    this.descriptionExpanded.update(v => !v);
  }

  // ── Cooking status actions ─────────────────────────────────────────────────

  startCooking() {
    const recipeId = this.recipe()?.id;
    if (!recipeId || this.statusActionLoading()) return;
    this.statusActionLoading.set(true);
    this.statusActionError.set(null);
    this.statusService.markInProgress(recipeId).subscribe({
      next: (dto) => {
        this.recipeStatus.set(dto);
        this.statusActionLoading.set(false);
      },
      error: () => {
        this.statusActionError.set('Could not start the recipe. Try again.');
        this.statusActionLoading.set(false);
        setTimeout(() => this.statusActionError.set(null), 4000);
      }
    });
  }

  openDoneModal() {
    const recipeId = this.recipe()?.id;
    if (!recipeId) return;
    this.feedbackError.set(null);
    this.feedbackMissingIngredients.set(null);
    this.statusService.canComplete(recipeId).subscribe({
      next: () => {
        this.showFeedbackModal.set(true);
      },
      error: (err) => {
        const body = err.error;
        if (body?.missingIngredients?.length) {
          this.feedbackMissingIngredients.set(body.missingIngredients);
        } else {
          this.feedbackError.set(body?.message || 'Cannot complete recipe right now.');
        }
        this.showFeedbackModal.set(true); // open modal in error state
      }
    });
  }

  onErrorDismissed() {
    this.feedbackError.set(null);
    this.feedbackMissingIngredients.set(null);
    this.showFeedbackModal.set(false);
  }

  onFeedbackSubmitted(feedback: SubmitFeedbackRequest) {
    const recipeId = this.recipe()?.id;
    if (!recipeId) return;
    this.statusService.markDone(recipeId, feedback).subscribe({
      next: (dto) => {
        this.recipeStatus.set(dto);
        this.feedbackError.set(null);
        this.showFeedbackModal.set(false);
      },
      error: (err) => {
        this.handleMarkDoneError(err);
      }
    });
  }

  onFeedbackSkipped() {
    const recipeId = this.recipe()?.id;
    if (!recipeId) return;
    this.statusService.markDone(recipeId, null).subscribe({
      next: (dto) => {
        this.recipeStatus.set(dto);
        this.feedbackError.set(null);
        this.showFeedbackModal.set(false);
      },
      error: (err) => {
        this.handleMarkDoneError(err);
      }
    });
  }

  private handleMarkDoneError(err: any) {
    const body = err.error;
    if (body?.missingIngredients?.length) {
      this.feedbackMissingIngredients.set(body.missingIngredients);
    } else {
      const msg = body?.message || body || err.message || 'Failed to mark recipe as done.';
      this.feedbackError.set(msg);
    }
  }

  cancelCooking() {
    const recipeId = this.recipe()?.id;
    if (!recipeId || this.statusActionLoading()) return;
    this.statusActionLoading.set(true);
    this.statusService.cancelInProgress(recipeId).subscribe({
      next: () => {
        this.recipeStatus.set(null);
        this.statusActionLoading.set(false);
      },
      error: () => this.statusActionLoading.set(false)
    });
  }

  goBack() {
    this.location.back();
  }
}
