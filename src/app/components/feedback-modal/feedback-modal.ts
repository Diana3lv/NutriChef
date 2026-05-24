import { Component, Input, Output, EventEmitter, signal, OnInit, OnChanges, SimpleChanges, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeFeedbackDTO, SubmitFeedbackRequest } from '../../services/recipe-status.service';

export interface MissingIngredient {
  name: string;
  needed: string;
  available: string;
  unit: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-modal.html',
  styleUrl: './feedback-modal.scss',
})
export class FeedbackModal implements OnInit, OnChanges {
  @Input() recipeTitle: string = '';
  @Input() existingFeedback: RecipeFeedbackDTO | null = null;
  @Input() errorMessage: string | null = null;
  @Input() missingIngredients: MissingIngredient[] | null = null;

  @Output() submitted = new EventEmitter<SubmitFeedbackRequest>();
  @Output() skipped = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  error = signal<string | null>(null);
  missing = signal<MissingIngredient[] | null>(null);
  /** When existingFeedback is set, start on the confirm screen */
  showConfirmScreen = signal(false);

  selectedRating = signal(0);
  likedNotes = signal('');
  improvementNotes = signal('');
  ratingError = signal(false);

  readonly stars = [1, 2, 3, 4, 5];

  get isUpdate(): boolean {
    return this.existingFeedback !== null;
  }

  constructor() {
    // Watch for changes to errorMessage input
    effect(() => {
      if (this.errorMessage) {
        this.error.set(this.errorMessage);
        this.showConfirmScreen.set(false);
      }
    });
  }

  ngOnInit() {
    if (this.existingFeedback) {
      // Start on confirm screen when updating
      this.showConfirmScreen.set(true);
      this.selectedRating.set(this.existingFeedback.rating);
      this.likedNotes.set(this.existingFeedback.likedNotes ?? '');
      this.improvementNotes.set(this.existingFeedback.improvementNotes ?? '');
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['errorMessage'] && this.errorMessage) {
      this.error.set(this.errorMessage);
      this.showConfirmScreen.set(false);
    }
    if (changes['missingIngredients'] && this.missingIngredients?.length) {
      this.missing.set(this.missingIngredients);
      this.error.set('missing'); // truthy sentinel to trigger error screen
      this.showConfirmScreen.set(false);
    }
  }

  confirmYes() {
    this.showConfirmScreen.set(false);
  }

  confirmNo() {
    this.skipped.emit();
  }

  setRating(star: number) {
    this.selectedRating.set(star);
    this.ratingError.set(false);
  }

  submit() {
    if (this.selectedRating() < 1) {
      this.ratingError.set(true);
      return;
    }
    this.submitted.emit({
      rating: this.selectedRating(),
      likedNotes: this.likedNotes() || undefined,
      improvementNotes: this.improvementNotes() || undefined,
    });
  }

  cancel() {
    this.skipped.emit();
  }
}
