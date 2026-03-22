export interface HealthOption {
  key: string;
  label: string;
  apiValue: string;
}

export const ALLERGY_OPTIONS: HealthOption[] = [
  { key: 'nuts', label: 'Nuts', apiValue: 'TREE_NUTS' },
  { key: 'peanuts', label: 'Peanuts', apiValue: 'PEANUTS' },
  { key: 'shellfish', label: 'Shellfish', apiValue: 'SHELLFISH' },
  { key: 'fish', label: 'Fish', apiValue: 'FISH' },
  { key: 'dairy', label: 'Dairy', apiValue: 'DAIRY' },
  { key: 'eggs', label: 'Eggs', apiValue: 'EGGS' },
  { key: 'soy', label: 'Soy', apiValue: 'SOY' },
  { key: 'wheat', label: 'Wheat', apiValue: 'WHEAT' }
];

export const DIETARY_PREFERENCE_OPTIONS: HealthOption[] = [
  { key: 'vegetarian', label: 'Vegetarian', apiValue: 'VEGETARIAN' },
  { key: 'vegan', label: 'Vegan', apiValue: 'VEGAN' },
  { key: 'pescatarian', label: 'Pescatarian', apiValue: 'PESCATARIAN' },
  { key: 'keto', label: 'Keto', apiValue: 'KETO' },
  { key: 'paleo', label: 'Paleo', apiValue: 'PALEO' },
  { key: 'glutenFree', label: 'Gluten-Free', apiValue: 'GLUTEN_FREE' },
  { key: 'dairyFree', label: 'Dairy-Free', apiValue: 'DAIRY_FREE' },
  { key: 'lowCarb', label: 'Low-Carb', apiValue: 'LOW_CARB' }
];
