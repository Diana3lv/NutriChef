import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

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
  private router = inject(Router);
  activeDropdown = signal<string | null>(null);

  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  activeGroup = computed(() => {
    const url = this.currentUrl();
    for (const menu of this.menuItems) {
      if (menu.items.some(item => url.startsWith(item.route))) return menu.label;
    }
    return null;
  });

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

  private closeTimerId: ReturnType<typeof setTimeout> | null = null;

  openDropdown(label: string) {
    if (this.closeTimerId !== null) {
      clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }
    this.activeDropdown.set(label);
  }

  startCloseTimer() {
    if (this.closeTimerId !== null) clearTimeout(this.closeTimerId);
    this.closeTimerId = setTimeout(() => {
      this.activeDropdown.set(null);
      this.closeTimerId = null;
    }, 350);
  }

  cancelCloseTimer() {
    if (this.closeTimerId !== null) {
      clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }
  }

  closeDropdown() {
    if (this.closeTimerId !== null) clearTimeout(this.closeTimerId);
    this.activeDropdown.set(null);
  }

  selectMenuItem(item: DropdownItem) {
    this.closeDropdown();
  }

  navigateToFavourites() {
    this.router.navigate(['/favorites']);
  }

  navigateToDone() {
    this.router.navigate(['/done-recipes']);
  }
}
