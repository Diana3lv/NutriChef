import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IngredientCard } from './ingredient-card';
import { IngredientCategory } from '../../../interfaces/inventory';

describe('IngredientCard', () => {
  let component: IngredientCard;
  let fixture: ComponentFixture<IngredientCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngredientCard]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngredientCard);
    component = fixture.componentInstance;
    
    component.item = {
      id: '1',
      name: 'Test Item',
      quantity: 1,
      unit: 'kg',
      category: IngredientCategory.Other,
      expiryDate: new Date().toISOString()
    };
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
