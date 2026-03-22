export interface Recipe {
  id: number;
  title: string;
  description: string;
  instructions: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
  sourceApi: string;
  ingredients?: Ingredient[];
}

export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}
