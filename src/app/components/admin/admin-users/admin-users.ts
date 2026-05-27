import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserManagementService, UserAdmin } from '../../../services/user-management.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss']
})
export class AdminUsersComponent implements OnInit {
  users = signal<UserAdmin[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  searchQuery = signal('');
  roleFilter = signal('');
  statusFilter = signal('');
  sortBy = signal('');

  // Pagination
  currentPage = signal(1);
  itemsPerPage = signal(10);

  filteredUsers = computed(() => {
    let filtered = this.users();
    
    const search = this.searchQuery().trim().toLowerCase();
    if (search) {
      const parts = search.split(/\s+/).filter(p => p.length > 0);
      filtered = filtered.filter(u => {
        const email = u.email.toLowerCase();
        const firstName = u.firstName.toLowerCase();
        const lastName = u.lastName.toLowerCase();
        return parts.every(p =>
          email.includes(p) || firstName.includes(p) || lastName.includes(p)
        );
      });
    }

    // Apply role filter
    const role = this.roleFilter();
    if (role) {
      filtered = filtered.filter(u => u.role === role);
    }

    // Apply status filter
    const status = this.statusFilter();
    if (status === 'online') {
      filtered = filtered.filter(u => this.isOnline(u));
    } else if (status === 'offline') {
      filtered = filtered.filter(u => !this.isOnline(u));
    }

    // Sort
    const sort = this.sortBy();
    return [...filtered].sort((a, b) => {
      if (sort === 'recipes') {
        return b.recipesCreatedCount - a.recipesCreatedCount;
      }
      // Default: admins first, then by creation date descending
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  paginatedUsers = computed(() => {
    const filtered = this.filteredUsers();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return filtered.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredUsers().length / this.itemsPerPage());
  });

  roleOptions = [
    { label: 'User', value: 'USER' },
    { label: 'Admin', value: 'ADMIN' }
  ];

  private router = inject(Router);

  constructor(private userManagementService: UserManagementService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.userManagementService.getAllUsers().subscribe({
      next: (users: UserAdmin[]) => {
        this.users.set(users.sort((a: UserAdmin, b: UserAdmin) => {
          // Sort by creation date, newest first
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }));
        this.currentPage.set(1);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        this.error.set('Failed to load users');
        console.error('Error loading users:', err);
        this.isLoading.set(false);
      }
    });
  }

  onSearch() {
    this.currentPage.set(1);
  }

  onRoleFilterChange() {
    this.currentPage.set(1);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.roleFilter.set('');
    this.statusFilter.set('');
    this.sortBy.set('');
    this.currentPage.set(1);
  }

  changeRole(user: UserAdmin, newRole: string) {
    if (user.role === newRole) return;

    this.userManagementService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser: UserAdmin) => {
        // Update the user in the list
        const users = this.users();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
          users[index] = updatedUser;
          this.users.set([...users]);
        }
        this.successMessage.set(`User role changed to ${newRole}`);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err: any) => {
        this.error.set('Failed to update user role');
        console.error('Error updating role:', err);
      }
    });
  }

  deleteUser(user: UserAdmin) {
    if (confirm(`Permanently delete user ${user.email}? This action cannot be undone.`)) {
      this.userManagementService.deleteUser(user.id).subscribe({
        next: () => {
          const users = this.users().filter(u => u.id !== user.id);
          this.users.set(users);
          this.successMessage.set('User deleted');
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err: any) => {
          this.error.set('Failed to delete user');
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  getRoleBadgeClass(role: string): string {
    return `role-${role.toLowerCase().replace('_', '-')}`;
  }

  formatDate(dateString?: string): string {
    return this.userManagementService.formatDate(dateString);
  }

  getUserDisplayName(user: UserAdmin): string {
    return this.userManagementService.getUserDisplayName(user);
  }

  isOnline(user: UserAdmin): boolean {
    if (!user.lastLogin) return false;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    return new Date(user.lastLogin) > twoHoursAgo;
  }

  getStatusLabel(user: UserAdmin): string {
    if (!user.isActive) return 'Deactivated';
    return this.isOnline(user) ? 'Online' : 'Offline';
  }

  getStatusClass(user: UserAdmin): string {
    if (!user.isActive) return 'deactivated';
    return this.isOnline(user) ? 'online' : 'offline';
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
