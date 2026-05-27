export interface UnitOption {
  value: string;
  label: string;
}

export const INGREDIENT_UNITS: UnitOption[] = [
  // Weight
  { value: 'g',     label: 'g — grams' },
  { value: 'kg',    label: 'kg — kilograms' },
  { value: 'mg',    label: 'mg — milligrams' },
  { value: 'oz',    label: 'oz — ounces' },
  { value: 'lb',    label: 'lb — pounds' },
  // Volume
  { value: 'ml',    label: 'ml — milliliters' },
  { value: 'l',     label: 'l — liters' },
  { value: 'cup',   label: 'cup — cups' },
  { value: 'tbsp',  label: 'tbsp — tablespoons' },
  { value: 'tsp',   label: 'tsp — teaspoons' },
  { value: 'fl oz', label: 'fl oz — fluid ounces' },
  // Count / pieces
  { value: 'pcs',   label: 'pcs — pieces' },
  { value: 'whole', label: 'whole — whole' },
  { value: 'clove', label: 'clove — cloves' },
  { value: 'slice', label: 'slice — slices' },
  { value: 'bunch', label: 'bunch — bunch' },
  { value: 'pinch', label: 'pinch — pinch' },
  // Packaging
  { value: 'can',   label: 'can — can' },
  { value: 'pack',  label: 'pack — pack' },
];

export const UNIT_VALUES = INGREDIENT_UNITS.map(u => u.value);
