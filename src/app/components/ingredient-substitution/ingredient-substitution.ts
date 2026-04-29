import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientSubstitutionService, Substitution } from '../../services/ingredient-substitution.service';

@Component({
  selector: 'app-ingredient-substitution',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredient-substitution.html',
  styleUrls: ['./ingredient-substitution.scss']
})
export class IngredientSubstitutionComponent implements OnInit {
  @Input() ingredientId: number | null = null;
  @Input() ingredientName: string = '';

  substitutions: Substitution[] = [];
  loading = false;
  error: string | null = null;
  selectedSubstitution: Substitution | null = null;

  constructor(private substitutionService: IngredientSubstitutionService) {}

  ngOnInit(): void {
    if (this.ingredientId) {
      this.loadSubstitutions();
    }
  }

  loadSubstitutions(): void {
    if (!this.ingredientId) return;

    this.loading = true;
    this.error = null;

    this.substitutionService.getSubstitutions(this.ingredientId).subscribe({
      next: (data) => {
        this.substitutions = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading substitutions:', err);
        this.error = 'Failed to load substitutions. Please try again.';
        this.loading = false;
      }
    });
  }

  selectSubstitution(substitution: Substitution): void {
    this.selectedSubstitution = substitution;
  }

  hasAllergens(allergens: string[]): boolean {
    return allergens && allergens.length > 0;
  }

  getRatioDescription(ratio: string): string {
    // Format ratio for display (e.g., "1:2" stays as "1:2")
    return ratio || '1:1';
  }
}
