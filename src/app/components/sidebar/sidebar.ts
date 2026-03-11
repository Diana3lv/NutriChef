import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  private sidebarService = inject(SidebarService);
  private authService = inject(Auth);
  private router = inject(Router);

  isExpanded = this.sidebarService.isExpanded;
  
  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is any => event.constructor.name === 'NavigationEnd'),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  showHomeButton = computed(() => {
    const url = this.currentUrl();
    return url !== '/home' && url !== '/';
  });
  
  toggleIcon = 'assets/images/icons/arrow.png';
  signOutIcon = 'assets/images/icons/sign_out.png';

  menuItems = [
    { label: 'Profile', route: '/profile', icon: 'assets/images/icons/profile.png' },
    { label: 'Inventory', route: '/inventory', icon: 'assets/images/icons/inventory.png' },
    { label: 'Settings', route: '/settings', icon: 'assets/images/icons/settings.png' },
    { label: 'Ask NutriAI', route: '/nutri-ai', icon: 'assets/images/icons/nutri-ai.png' },
    { label: 'Favorites', route: '/favorites', icon: 'assets/images/icons/favorites.png' },
    { label: 'Shopping List', route: '/shopping-list', icon: 'assets/images/icons/shopping_list.png' }
  ];

  toggleSidebar() {
    this.sidebarService.toggle();
  }

  closeSidebar() {
    this.sidebarService.close();
  }

  signOut() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
