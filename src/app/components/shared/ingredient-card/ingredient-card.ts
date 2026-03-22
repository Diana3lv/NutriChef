import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../../interfaces/inventory';

@Component({
  selector: 'app-ingredient-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ingredient-card.html',
  styleUrl: './ingredient-card.scss'
})
export class IngredientCard {
  @Input({ required: true }) item!: InventoryItem;
  @Input() isEditing: boolean = false;

  @Output() delete = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() updateQuantity = new EventEmitter<number>();
  @Output() updateUnit = new EventEmitter<string>();
  @Output() updateExpiry = new EventEmitter<string>();

  isExpiringSoon(dateStr: string): boolean {
    const today = new Date();
    const expiry = new Date(dateStr);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  }

  isExpired(dateStr: string): boolean {
    const today = new Date();
    const expiry = new Date(dateStr);
    return expiry < today;
  }

  getExpiryLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    // Reset time components for accurate day calculation
    d.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    
    if (d < now) return 'Expired';
    
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days left`;
    
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  getExpiryClass(dateStr: string): string {
    if (this.isExpired(dateStr)) return 'expired';
    if (this.isExpiringSoon(dateStr)) return 'soon';
    return 'ok';
  }

  onQuantityChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateQuantity.emit(parseFloat(target.value));
  }

  onUnitChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.updateUnit.emit(target.value);
  }

  onExpiryChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.updateExpiry.emit(target.value);
  }
}
