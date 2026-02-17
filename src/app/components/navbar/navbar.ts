import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DropdownItem {
  label: string;
  route: string;
}

interface NavMenu {
  label: string;
  items: DropdownItem[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  activeDropdown = signal<string | null>(null);

  menuItems: NavMenu[] = [
    {
      label: 'Recipes',
      items: [
        { label: 'Breakfast & Brunch Recipes', route: '/recipes/breakfast' },
        { label: 'Lunch Recipes', route: '/recipes/lunch' },
        { label: 'Dinner Recipes', route: '/recipes/dinner' },
        { label: 'Dessert Recipes', route: '/recipes/dessert' },
        { label: 'Drink Recipes', route: '/recipes/drinks' },
        { label: 'Quick & Easy Recipes', route: '/recipes/quick-easy' },
        { label: 'Baking Recipes', route: '/recipes/baking' }
      ]
    },
    {
      label: 'Cuisine',
      items: [
        { label: 'Mexican Recipes', route: '/cuisine/mexican' },
        { label: 'Italian Recipes', route: '/cuisine/italian' },
        { label: 'French Recipes', route: '/cuisine/french' },
        { label: 'Spanish Recipes', route: '/cuisine/spanish' },
        { label: 'Latin American Recipes', route: '/cuisine/latin-american' },
        { label: 'Thai Recipes', route: '/cuisine/thai' },
        { label: 'Korean Recipes', route: '/cuisine/korean' },
        { label: 'Japanese Recipes', route: '/cuisine/japanese' },
        { label: 'Chinese Recipes', route: '/cuisine/chinese' },
        { label: 'Indian Recipes', route: '/cuisine/indian' }
      ]
    },
    {
      label: 'Popular',
      items: [
        { label: 'Soup Recipes', route: '/popular/soup' },
        { label: 'Pasta Recipes', route: '/popular/pasta' },
        { label: 'Casserole Recipes', route: '/popular/casserole' },
        { label: 'Spicy Recipes', route: '/popular/spicy' },
        { label: 'Bread Recipes', route: '/popular/bread' },
        { label: 'Cookie Recipes', route: '/popular/cookie' },
        { label: 'Salad Recipes', route: '/popular/salad' }
      ]
    },
    {
      label: 'Seasonal',
      items: [
        { label: 'Spring Recipes', route: '/seasonal/spring' },
        { label: 'Summer Recipes', route: '/seasonal/summer' },
        { label: 'Fall Recipes', route: '/seasonal/fall' },
        { label: 'Winter Recipes', route: '/seasonal/winter' },
        { label: 'Holiday Recipes', route: '/seasonal/holiday' }
      ]
    }
  ];

  toggleDropdown(label: string, event: Event) {
    event.stopPropagation();
    this.activeDropdown.update(current => current === label ? null : label);
  }

  openDropdown(label: string) {
    this.activeDropdown.set(label);
  }

  closeDropdown() {
    this.activeDropdown.set(null);
  }

  selectMenuItem(item: DropdownItem) {
    console.log('Selected menu item:', item.label, 'Route:', item.route);
    this.closeDropdown();

    //TODO: Implement navigation logic here
  }

  navigateToFavourites() {
    console.log('Navigating to Favourites');

    //TODO: Implement navigation logic to Favourites here
  }
}
