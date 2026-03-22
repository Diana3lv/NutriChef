import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeDetail } from './recipe-detail';
import { ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { of } from 'rxjs';

describe('RecipeDetail', () => {
  let component: RecipeDetail;
  let fixture: ComponentFixture<RecipeDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        },
        {
          provide: RecipeService,
          useValue: {
            getById: () => of({ 
                id: 1, 
                title: 'Test', 
                description: 'Test',
                instructions: '1. Step one\n2. Step two',
                prepTimeMinutes: 10,
                cookTimeMinutes: 20,
                servings: 4,
                difficulty: 'EASY',
                imageUrl: 'http://test.com',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sourceUrl: '',
                sourceApi: 'MOCK'
            })
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecipeDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
