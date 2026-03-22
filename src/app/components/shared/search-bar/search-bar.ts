import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Input() placeholder = 'Search by recipe title or by filters...';
  @Input() showFilter = true;
  @Input() size: 'default' | 'small' = 'default';
  @Input() liveSearch = false;

  @Output() search = new EventEmitter<string>();
  @Output() filterOpen = new EventEmitter<void>();

  searchQuery: string = '';

  onFilterOpen(): void {
    this.filterOpen.emit();
  }

  onSearch() {
    this.search.emit(this.searchQuery);
  }

  onInputChange() {
    if (this.liveSearch) {
      this.search.emit(this.searchQuery);
    }
  }
}
