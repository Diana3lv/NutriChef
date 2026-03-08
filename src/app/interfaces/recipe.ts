export interface Recipe {
  id: number;
  name: string;
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
}
