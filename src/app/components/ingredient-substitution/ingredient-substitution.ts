import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IngredientSubstitutionService, Substitution, SubstitutionAlternative } from '../../services/ingredient-substitution.service';

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
  selectedAlternative: SubstitutionAlternative | null = null;

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
        console.log(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading substitutions:', err);
        this.error = 'Failed to load substitutions. Please try again.';
        this.loading = false;
      }
    });
  }

  selectAlternative(alternative: SubstitutionAlternative): void {
    this.selectedAlternative = alternative;
  }

  hasAllergens(allergens: string[]): boolean {
    return allergens && allergens.length > 0;
  }

  getRatioDescription(ratio: number | undefined): string {
    if (!ratio || ratio === 1) return '1:1';
    return `1:${ratio}`;
  }
}
