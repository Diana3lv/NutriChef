import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Navbar } from '../../components/navbar/navbar';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Sidebar, Navbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private sidebarService = inject(SidebarService);
  private router = inject(Router);

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
