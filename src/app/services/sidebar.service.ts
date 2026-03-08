import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  isExpanded = signal(false);

  toggle() {
    this.isExpanded.update(expanded => !expanded);
  }

  close() {
    this.isExpanded.set(false);
  }

  open() {
    this.isExpanded.set(true);
  }
}
