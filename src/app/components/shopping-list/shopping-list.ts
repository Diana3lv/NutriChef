import { Component, OnInit, computed, signal, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ShoppingListService, ShoppingListItem } from '../../services/shopping-list.service';
import { IngredientManagementService, SimpleIngredient } from '../../services/ingredient-management.service';
import { FormsModule } from '@angular/forms';
import { STORAGE_KEYS } from '../../constants/storage-keys';

const HANDWRITING_FONTS = [
  { label: 'Caveat',              value: 'Caveat, cursive' },
  { label: 'Shadows Into Light',  value: "'Shadows Into Light', cursive" },
  { label: 'Indie Flower',        value: "'Indie Flower', cursive" },
  { label: 'Dancing Script',      value: "'Dancing Script', cursive" },
  { label: "Architect's Daughter",value: "'Architects Daughter', cursive" },
  { label: 'Kalam',               value: 'Kalam, cursive' },
  { label: 'Satisfy',             value: 'Satisfy, cursive' },
  { label: 'Homemade Apple',      value: "'Homemade Apple', cursive" },
  { label: 'Reenie Beanie',       value: "'Reenie Beanie', cursive" },
  { label: 'Nanum Pen Script',    value: "'Nanum Pen Script', cursive" },
];

export interface CategoryDef {
  key: string;
  icon: string;
  color: string;
  pinColor: string;
}

const CATEGORY_DEFS: CategoryDef[] = [
  // Produce
  { key: 'Fruits',              icon: 'assets/images/icons/ingredient-categories/fruits.png',        color: '#FFF0F0', pinColor: '#D84040' },
  { key: 'Vegetables',          icon: 'assets/images/icons/ingredient-categories/vegetables.png',    color: '#EDFAEE', pinColor: '#3A8A3E' },

  // Proteins & Dairy
  { key: 'Dairy & Eggs',        icon: 'assets/images/icons/ingredient-categories/eggs-and-dairy.png',color: '#FEFBE8', pinColor: '#C89A10' },
  { key: 'Meat',                icon: 'assets/images/icons/ingredient-categories/meat.png',           color: '#FFF0ED', pinColor: '#B83020' },
  { key: 'Seafood',             icon: 'assets/images/icons/ingredient-categories/seafood.png',        color: '#EBF5FF', pinColor: '#1A65B8' },

  // Pantry & Dry Goods
  { key: 'Grains & Pasta',      icon: 'assets/images/icons/ingredient-categories/grains-and-pasta.png', color: '#FEF3E2', pinColor: '#C86A10' },
  { key: 'Baking & Spices',     icon: 'assets/images/icons/ingredient-categories/spices.png',         color: '#FAF0E6', pinColor: '#8B5A2B' },
  { key: 'Canned Goods',        icon: 'assets/images/icons/ingredient-categories/can.png',             color: '#ECEFF1', pinColor: '#546E7A' },
  { key: 'Sauces & Condiments', icon: 'assets/images/icons/ingredient-categories/sauces-and-condiments.png',                                                             color: '#FFF3E0', pinColor: '#E65100' },

  // Center Aisle & Peripherals
  { key: 'Snacks & Sweets',     icon: 'assets/images/icons/ingredient-categories/pretzel.png',        color: '#FFF8E1', pinColor: '#F57F17' },
  { key: 'Beverages',           icon: 'assets/images/icons/ingredient-categories/beverages.png',      color: '#F3E5F5', pinColor: '#6A1B9A' },
  { key: 'Frozen',              icon: 'assets/images/icons/ingredient-categories/ice.png',             color: '#E0F7FA', pinColor: '#00838F' },

  // Catch-all
  { key: 'Other',               icon: 'assets/images/icons/ingredient-categories/other-food.png',    color: '#F0ECFF', pinColor: '#5830A8' },
];

const VALID_CATEGORY_KEYS = new Set(CATEGORY_DEFS.map(d => d.key));

function normalizeCategory(raw?: string): string {
  if (!raw) return 'Other';
  if (VALID_CATEGORY_KEYS.has(raw)) return raw;
  const l = raw.toLowerCase();
  if (/fruit|berry|citrus|apple|orange|banana|grape|melon|peach|pear|plum/.test(l)) return 'Fruits';
  if (/vegeta|vegg|herb|lettuce|spinach|broccoli|carrot|onion|tomato|pepper|garlic|cabbage|celery|cucumber/.test(l)) return 'Vegetables';
  if (/dairy|milk|cheese|yogurt|cream|butter|egg/.test(l)) return 'Dairy & Eggs';
  if (/meat|chicken|beef|pork|lamb|turkey|sausage|bacon|ham|veal/.test(l)) return 'Meat';
  if (/fish|seafood|shrimp|salmon|tuna|crab|lobster|prawn|squid/.test(l)) return 'Seafood';
  if (/grain|bread|pasta|rice|flour|cereal|oat|wheat|barley|corn|rye|noodle/.test(l)) return 'Grains & Pasta';
  if (/spice|herb|baking|vanilla|cinnamon|cumin|paprika|salt|pepper|sugar|yeast|baking soda|baking powder/.test(l)) return 'Baking & Spices';
  if (/can|canned|tin|beans|lentil|chickpea|tomato sauce|broth|stock/.test(l)) return 'Canned Goods';
  if (/sauce|condiment|ketchup|mustard|mayo|vinegar|oil|dressing|soy|hot sauce/.test(l)) return 'Sauces & Condiments';
  if (/snack|chip|cracker|pretzel|cookie|chocolate|candy|sweet|dessert|cake|biscuit/.test(l)) return 'Snacks & Sweets';
  if (/drink|juice|water|soda|coffee|tea|beverage|wine|beer|milk drink/.test(l)) return 'Beverages';
  if (/frozen|ice cream|gelato|freezer/.test(l)) return 'Frozen';
  return 'Other';
}

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './shopping-list.html',
  styleUrls: ['./shopping-list.scss']
})
export class ShoppingListComponent implements OnInit {
  shoppingItems      = signal<ShoppingListItem[]>([]);
  isLoading          = signal(false);
  error              = signal<string | null>(null);
  expandedCategories = signal<Set<string>>(new Set());
  fontPickerOpen     = signal(false);
  selectedFont       = signal(localStorage.getItem(STORAGE_KEYS.shoppingListFont) ?? HANDWRITING_FONTS[0].value);
  lastModified       = signal<Date>(new Date());

  isAddOpen     = signal(false);
  allIngredients = signal<SimpleIngredient[]>([]);
  addSearch     = signal('');
  addSelected   = signal<SimpleIngredient | null>(null);
  addQty        = signal('1');
  addError      = signal<string | null>(null);
  addLoading    = signal(false);

  addResults = computed(() => {
    const term = this.addSearch().toLowerCase().trim();
    if (!term || this.addSelected()) return [];
    return this.allIngredients()
      .filter(i => i.name.toLowerCase().includes(term))
      .slice(0, 6);
  });

  editingItemId  = signal<number | null>(null);
  editingQtyStr  = signal('');

  fonts        = HANDWRITING_FONTS;
  categoryDefs = CATEGORY_DEFS;

  purchasedCount = computed(() => this.shoppingItems().filter(i => i.isPurchased).length);

  groupedCategories = computed(() => {
    const groups = new Map<string, ShoppingListItem[]>();
    for (const item of this.shoppingItems()) {
      const cat = normalizeCategory(item.category);
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(item);
    }
    return CATEGORY_DEFS
      .filter(def => groups.has(def.key))
      .map(def => ({ def, items: groups.get(def.key)! }));
  });

  formattedDate = computed(() => {
    const d = this.lastModified();
    return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  getCategoryDef(key: string): CategoryDef {
    return CATEGORY_DEFS.find(c => c.key === key) ?? CATEGORY_DEFS[CATEGORY_DEFS.length - 1];
  }

  isExpanded(cat: string): boolean {
    return this.expandedCategories().has(cat);
  }

  toggleAccordion(cat: string) {
    this.expandedCategories.update(s => {
      const next = new Set(s);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  }

  constructor(
    private shoppingListService: ShoppingListService,
    private ingredientService: IngredientManagementService,
  ) {
    effect(() => {
      const cats = this.groupedCategories();
      if (cats.length === 1) {
        this.expandedCategories.set(new Set([cats[0].def.key]));
      } else {
        this.expandedCategories.set(new Set());
      }
    });
  }

  ngOnInit() {
    this.loadShoppingList();
    this.ingredientService.getSimple().subscribe({
      next: ings => this.allIngredients.set(ings),
    });
  }

  loadShoppingList() {
    this.isLoading.set(true);
    this.error.set(null);
    this.shoppingListService.getShoppingList().subscribe({
      next: items => {
        this.shoppingItems.set(items);
        this.lastModified.set(new Date());
        this.isLoading.set(false);
      },
      error: err  => { this.error.set('Failed to load shopping list'); console.error(err); this.isLoading.set(false); }
    });
  }

  togglePurchased(itemId: number) {
    // Optimistically remove the item from the list (backend syncs inventory)
    this.shoppingItems.set(this.shoppingItems().filter(i => i.id !== itemId));
    this.shoppingListService.markAsPurchased(itemId).subscribe({
      next: () => {
        this.lastModified.set(new Date());
      },
      error: err => {
        // Reload list on error to restore the item
        console.error(err);
        this.loadShoppingList();
      }
    });
  }

  removeItem(ingredientId: number) {
    this.shoppingListService.batchDeleteItems([ingredientId]).subscribe({
      next: () => {
        this.shoppingItems.set(this.shoppingItems().filter(i => i.ingredientId !== ingredientId));
        this.lastModified.set(new Date());
      },
      error: (err) => {
        const msg = this.extractError(err, 'Cannot remove: needed by an in-progress recipe.');
        this.error.set(msg);
      }
    });
  }

  openAddPanel() {
    this.isAddOpen.set(true);
    this.addSearch.set('');
    this.addSelected.set(null);
    this.addQty.set('1');
    this.addError.set(null);
  }

  closeAddPanel() {
    this.isAddOpen.set(false);
  }

  pickAddIngredient(ing: SimpleIngredient) {
    this.addSelected.set(ing);
    this.addSearch.set(ing.name);
  }

  clearAddIngredient() {
    this.addSelected.set(null);
    this.addSearch.set('');
  }

  submitAddItem() {
    const ing = this.addSelected();
    const qty = parseFloat(this.addQty());
    if (!ing) { this.addError.set('Select an ingredient from the list.'); return; }
    if (isNaN(qty) || qty <= 0) { this.addError.set('Enter a valid quantity.'); return; }
    this.addLoading.set(true);
    this.addError.set(null);
    this.shoppingListService.addItem(ing.id, qty).subscribe({
      next: () => {
        this.addLoading.set(false);
        this.closeAddPanel();
        this.loadShoppingList();
      },
      error: () => { this.addLoading.set(false); this.addError.set('Failed to add item.'); }
    });
  }

  startEditQty(item: ShoppingListItem) {
    const ownQty = item.ownQuantity ?? 0;
    if (ownQty <= 0) return; // recipe-only items cannot be edited here
    this.editingItemId.set(item.id ?? null);
    this.editingQtyStr.set(String(ownQty));
  }

  saveEditQty(item: ShoppingListItem) {
    const newOwnQty = parseFloat(this.editingQtyStr());
    const currentOwn = item.ownQuantity ?? 0;
    if (isNaN(newOwnQty) || newOwnQty < 0) { this.cancelEditQty(); return; }
    // Can only decrease own quantity via this path
    const clamped = Math.min(newOwnQty, currentOwn);
    const delta = currentOwn - clamped;
    if (delta <= 0) { this.cancelEditQty(); return; }
    const id = item.id!;
    this.shoppingListService.reduceOwnQuantity(id, delta).subscribe({
      next: (updated) => {
        if (updated === null || updated.quantity <= 0) {
          this.shoppingItems.update(list => list.filter(i => i.id !== id));
        } else {
          this.shoppingItems.update(list => list.map(i => i.id === id ? updated : i));
        }
        this.editingItemId.set(null);
        this.lastModified.set(new Date());
      },
      error: () => this.editingItemId.set(null),
    });
  }

  cancelEditQty() { this.editingItemId.set(null); }

  reduceOwnQty(item: ShoppingListItem, amount: number) {
    const ownQty = item.ownQuantity ?? 0;
    if (amount < 1 || amount > ownQty) return;
    const id = item.id!;
    this.shoppingListService.reduceOwnQuantity(id, amount).subscribe({
      next: (updated) => {
        if (updated === null || updated.quantity <= 0) {
          this.shoppingItems.update(list => list.filter(i => i.id !== id));
        } else {
          this.shoppingItems.update(list => list.map(i => i.id === id ? updated : i));
        }
        this.lastModified.set(new Date());
      },
      error: () => {}
    });
  }

  private extractError(err: any, fallback: string): string {
    const body = err?.error;
    if (typeof body === 'string') return body.replace(/^"|"$/g, '');
    return fallback;
  }

  clearPurchased() {
    if (!confirm('Clear all purchased items?')) return;
    this.shoppingListService.clearPurchased().subscribe({
      next: () => {
        this.shoppingItems.set(this.shoppingItems().filter(i => !i.isPurchased));
        this.lastModified.set(new Date());
      },
      error: err => console.error(err)
    });
  }

  toggleFontPicker() { this.fontPickerOpen.update(v => !v); }

  setFont(value: string) { this.selectedFont.set(value); this.fontPickerOpen.set(false); localStorage.setItem(STORAGE_KEYS.shoppingListFont, value); }

  @HostListener('document:keydown.escape')
  closeFontPicker() { this.fontPickerOpen.set(false); }
}