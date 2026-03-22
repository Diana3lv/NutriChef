import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../../interfaces/recipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  @Input({ required: true }) recipe!: Recipe;
  @Output() cardClick = new EventEmitter<number>();

  onClick() {
    this.cardClick.emit(this.recipe.id);
  }

  getDifficultyClass(): string {
    return this.recipe?.difficulty?.toLowerCase() || 'unknown';
  }

  getTotalTime(): number {
    if (!this.recipe) return 0;
    return (this.recipe.prepTimeMinutes || 0) + (this.recipe.cookTimeMinutes || 0);
  }
}
