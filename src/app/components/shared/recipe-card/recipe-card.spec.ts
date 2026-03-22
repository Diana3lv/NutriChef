import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeCard } from './recipe-card';
import { Recipe } from '../../../interfaces/recipe';

describe('RecipeCard', () => {
  let component: RecipeCard;
  let fixture: ComponentFixture<RecipeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeCard]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipeCard);
    component = fixture.componentInstance;
    
    component.recipe = {
        id: 0,
        name: '',
        description: '',
        instructions: '',
        prepTimeMinutes: 0,
        cookTimeMinutes: 0,
        servings: 0,
        difficulty: 'EASY',
        imageUrl: '',
        createdAt: '',
        updatedAt: '',
        sourceUrl: '',
        sourceApi: ''
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
