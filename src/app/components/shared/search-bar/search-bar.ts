import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  @Output() search = new EventEmitter<string>();
  @Output() filterOpen = new EventEmitter<void>();

  searchQuery: string = '';

  onFilterOpen(): void {
    this.filterOpen.emit();
  }

  onSearch() {
    this.search.emit(this.searchQuery);
  }
}
