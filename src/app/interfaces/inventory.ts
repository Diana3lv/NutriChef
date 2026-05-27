export enum IngredientCategory {
  Fruits             = 'Fruits',
  Vegetables         = 'Vegetables',
  DairyAndEggs       = 'Dairy & Eggs',
  Meat               = 'Meat',
  Seafood            = 'Seafood',
  GrainsAndPasta     = 'Grains & Pasta',
  BakingAndSpices    = 'Baking & Spices',
  CannedGoods        = 'Canned Goods',
  SaucesAndCondiments = 'Sauces & Condiments',
  SnacksAndSweets    = 'Snacks & Sweets',
  Beverages          = 'Beverages',
  Frozen             = 'Frozen',
  Other              = 'Other',
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  expiryDate: string; // ISO Date string YYYY-MM-DD
}

export interface InventoryIngredientDTO {
  id?: number;
  ingredient: {
    id?: number;
    name: string;
    unit?: string;
    allergens?: string[];
    category?: string;
  };
  quantity: string;
  expiryDate?: string;
  notes?: string;
  dateAdded?: string;
}