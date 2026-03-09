import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Recipe } from '../../../interfaces/recipe';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  @Input({ required: true }) recipe!: Recipe;
  @Output() cardClick = new EventEmitter<number>();

  onClick() {
    this.cardClick.emit(this.recipe.id);
  }

  getTotalTime(): number {
    return this.recipe.prepTimeMinutes + this.recipe.cookTimeMinutes;
  }
}
