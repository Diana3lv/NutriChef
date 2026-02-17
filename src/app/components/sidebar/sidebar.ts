import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  isExpanded = signal(false);
  
  toggleIcon = 'assets/images/icons/arrow.png';
  signOutIcon = 'assets/images/icons/sign_out.png';

  menuItems = [
    { label: 'Profile', route: '/profile', icon: 'assets/images/icons/profile.png' },
    { label: 'Inventory', route: '/inventory', icon: 'assets/images/icons/inventory.png' },
    { label: 'Settings', route: '/settings', icon: 'assets/images/icons/settings.png' },
    { label: 'Ask NutriAI', route: '/nutri-ai', icon: 'assets/images/icons/nutri-ai.png' },
    { label: 'Favorites', route: '/favorites', icon: 'assets/images/icons/favorites.png' },
    { label: 'Shopping Cart', route: '/cart', icon: 'assets/images/icons/shopping_cart.png' }
  ];

  toggleSidebar() {
    this.isExpanded.update(expanded => !expanded);
  }

  closeSidebar() {
    this.isExpanded.set(false);
  }

  signOut() {
    // TODO: Implement sign-out logic here
  }
}
