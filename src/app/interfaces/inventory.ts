export enum IngredientCategory {
  Vegetables = 'Vegetables',
  Fruits = 'Fruits',
  Meat = 'Meat',
  Poultry = 'Poultry',
  Seafood = 'Seafood',
  Dairy = 'Dairy',
  Grains = 'Grains',
  Legumes = 'Legumes',
  Nuts_Seeds = 'Nuts_Seeds',
  Herbs_Spices = 'Herbs_Spices',
  Oils_Fats = 'Oils_Fats',
  Condiments = 'Condiments',
  Beverages = 'Beverages',
  Baking = 'Baking',
  Other = 'Other'
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  expiryDate: string; // ISO Date string YYYY-MM-DD
}