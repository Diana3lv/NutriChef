import { Component, inject, computed, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { SidebarService } from '../../services/sidebar.service';
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
export class MainLayout {
  private sidebarService = inject(SidebarService);
  private router = inject(Router);
  
  @ViewChild('contentWrapper') contentWrapper?: ElementRef<HTMLDivElement>;

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe(() => {
      this.contentWrapper?.nativeElement.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is any => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isInventoryPage = computed(() => this.currentUrl().includes('/inventory'));

  onContentScroll() {
    if (this.sidebarService.isExpanded()) {
      this.sidebarService.close();
    }
  }

  handleContentClick() {
    if (this.sidebarService.isExpanded()) {
      this.sidebarService.close();
    }
  }
}
