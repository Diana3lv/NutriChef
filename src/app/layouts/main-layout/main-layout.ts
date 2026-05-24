import { Component, inject, computed, ViewChild, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { SidebarService } from '../../services/sidebar.service';
import { Auth } from '../../services/auth.service';
import { filter, map } from 'rxjs/operators';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Sidebar, Navbar, CommonModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements AfterViewInit {
  private sidebarService = inject(SidebarService);
  private authService = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  
  @ViewChild('contentWrapper') contentWrapper?: ElementRef<HTMLDivElement>;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.contentWrapper?.nativeElement.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  ngAfterViewInit() {
    const el = this.contentWrapper?.nativeElement;
    if (!el) return;
    this.ngZone.runOutsideAngular(() => {
      el.addEventListener('scroll', () => {
        if (this.sidebarService.isExpanded()) {
          this.ngZone.run(() => this.sidebarService.close());
        }
      }, { passive: true });
    });
  }

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is any => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isAdmin = computed(() => this.authService.currentUser()?.role === 'ADMIN');
  isInventoryPage = computed(() => this.currentUrl().includes('/inventory'));
  showInventoryFab = computed(() => !this.isInventoryPage() && !this.isAdmin());
  showAdminFab = computed(() => this.isAdmin());

  handleContentClick() {
    if (this.sidebarService.isExpanded()) {
      this.sidebarService.close();
    }
  }

  signOut(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
