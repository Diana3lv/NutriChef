import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth.service';

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

  constructor(private authService: Auth) {}

  menuItems = [
    { label: 'Profile', route: '/profile', icon: 'assets/images/icons/profile.png' },
    { label: 'Inventory', route: '/inventory', icon: 'assets/images/icons/inventory.png' },
    { label: 'Settings', route: '/settings', icon: 'assets/images/icons/settings.png' },
    { label: 'Ask NutriAI', route: '/nutri-ai', icon: 'assets/images/icons/nutri-ai.png' },
    { label: 'Favorites', route: '/favorites', icon: 'assets/images/icons/favorites.png' },
    { label: 'Shopping List', route: '/shopping-list', icon: 'assets/images/icons/shopping_list.png' }
  ];

  toggleSidebar() {
    this.isExpanded.update(expanded => !expanded);
  }

  closeSidebar() {
    this.isExpanded.set(false);
  }

  signOut() {
    this.authService.logout();
  }
}
