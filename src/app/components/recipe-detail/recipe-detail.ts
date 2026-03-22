import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Recipe } from '../../interfaces/recipe';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);
  private location = inject(Location);

  recipe = signal<Recipe | null>(null);
  isFavorite = signal(false);
  isLoading = signal(true);
  error = signal<string | null>(null);

  parsedSteps = computed(() => {
    const instructions = this.recipe()?.instructions ?? '';
    return instructions
      .split(/\n|(?=\d+\.)/)
      .map(s => s.replace(/^\d+\.\s*/, '').trim())
      .filter(s => s.length > 0);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(Number(id));
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

  getDifficultyClass(): string {
    return this.recipe()?.difficulty?.toLowerCase() ?? '';
  }

  getTotalTime(): number {
    const recipe = this.recipe();
    if (!recipe) return 0;
    return (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  }

  toggleFavorite() {
    this.isFavorite.update(v => !v);
  }

  goBack() {
    this.location.back();
  }
}
