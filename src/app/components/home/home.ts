import { Component, inject, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Recipe } from '../../interfaces/recipe';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  private sidebarService = inject(SidebarService);
  isSidebarExpanded = this.sidebarService.isExpanded;
  showScrollIndicator = signal(true);

  private scrollListener?: () => void;

  searchQuery: string = '';

  popularRecipes: Recipe[] = [
    {
      id: 1,
      name: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta with creamy egg sauce',
      instructions: 'Cook pasta. Mix eggs and cheese. Combine with bacon.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 4,
      difficulty: 'EASY',
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    },
    {
      id: 2,
      name: 'Chicken Tikka Masala',
      description: 'Creamy and spicy Indian curry',
      instructions: 'Marinate chicken. Grill. Prepare curry sauce.',
      prepTimeMinutes: 30,
      cookTimeMinutes: 30,
      servings: 6,
      difficulty: 'MEDIUM',
      imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    },
    {
      id: 3,
      name: 'Greek Salad',
      description: 'Fresh Mediterranean salad with feta',
      instructions: 'Chop vegetables. Add feta. Dress with olive oil.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 0,
      servings: 4,
      difficulty: 'EASY',
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    },
    {
      id: 4,
      name: 'Beef Wellington',
      description: 'Elegant beef wrapped in pastry',
      instructions: 'Sear beef. Wrap in pastry. Bake.',
      prepTimeMinutes: 60,
      cookTimeMinutes: 40,
      servings: 8,
      difficulty: 'HARD',
      imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    }
  ];

  recommendedRecipes: Recipe[] = [
    {
      id: 5,
      name: 'Vegetable Stir Fry',
      description: 'Quick and healthy Asian dish',
      instructions: 'Heat wok. Stir fry vegetables. Add sauce.',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      servings: 4,
      difficulty: 'EASY',
      imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    },
    {
      id: 6,
      name: 'Chocolate Lava Cake',
      description: 'Decadent dessert with molten center',
      instructions: 'Melt chocolate. Mix batter. Bake.',
      prepTimeMinutes: 20,
      cookTimeMinutes: 12,
      servings: 6,
      difficulty: 'MEDIUM',
      imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    },
    {
      id: 7,
      name: 'Fish Tacos',
      description: 'Fresh fish with zesty toppings',
      instructions: 'Season fish. Grill. Assemble tacos.',
      prepTimeMinutes: 15,
      cookTimeMinutes: 10,
      servings: 4,
      difficulty: 'EASY',
      imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceUrl: '',
      sourceApi: 'MOCK'
    }
  ];

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

  onSearch(){
    // TODO: Implement search functionality
  }

  viewRecipe(recipeId: number) {
    // TODO: Navigate to recipe details
  }
}
