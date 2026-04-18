import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NutritionProfileOptionsService, HealthOption } from './nutrition-profile-options.service';

describe('NutritionProfileOptionsService', () => {
  let service: NutritionProfileOptionsService;
  let httpMock: HttpTestingController;

  const mockAllergens: HealthOption[] = [
    { apiValue: 'PEANUTS', label: 'Peanuts' },
    { apiValue: 'TREE_NUTS', label: 'Tree Nuts' },
    { apiValue: 'DAIRY', label: 'Dairy' }
  ];

  const mockDietaryPreferences: HealthOption[] = [
    { apiValue: 'VEGETARIAN', label: 'Vegetarian' },
    { apiValue: 'VEGAN', label: 'Vegan' },
    { apiValue: 'KETO', label: 'Keto' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NutritionProfileOptionsService]
    });

    service = TestBed.inject(NutritionProfileOptionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch allergens from correct endpoint', () => {
    let result: HealthOption[] | undefined;
    
    service.getAllergens().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('/api/nutrition/preferences/allergens');
    expect(req.request.method).toBe('GET');
    req.flush(mockAllergens);
    
    expect(result).toEqual(mockAllergens);
  });

  it('should fetch dietary preferences from correct endpoint', () => {
    let result: HealthOption[] | undefined;
    
    service.getDietaryPreferences().subscribe((data) => {
      result = data;
    });

    const req = httpMock.expectOne('/api/nutrition/preferences/dietary-preferences');
    expect(req.request.method).toBe('GET');
    req.flush(mockDietaryPreferences);
    
    expect(result).toEqual(mockDietaryPreferences);
  });

  it('should cache allergens after first request', () => {
    let firstResult: HealthOption[] | undefined;
    let secondResult: HealthOption[] | undefined;
    
    // First request
    service.getAllergens().subscribe((data) => {
      firstResult = data;
    });
    const req1 = httpMock.expectOne('/api/nutrition/preferences/allergens');
    req1.flush(mockAllergens);

    // Second request should use cache (no new HTTP request)
    service.getAllergens().subscribe((data) => {
      secondResult = data;
    });
    
    expect(firstResult).toEqual(mockAllergens);
    expect(secondResult).toEqual(mockAllergens);
    httpMock.expectNone('/api/nutrition/preferences/allergens');
  });

  it('should cache dietary preferences after first request', () => {
    let firstResult: HealthOption[] | undefined;
    let secondResult: HealthOption[] | undefined;
    
    // First request
    service.getDietaryPreferences().subscribe((data) => {
      firstResult = data;
    });
    const req1 = httpMock.expectOne('/api/nutrition/preferences/dietary-preferences');
    req1.flush(mockDietaryPreferences);

    // Second request should use cache (no new HTTP request)
    service.getDietaryPreferences().subscribe((data) => {
      secondResult = data;
    });
    
    expect(firstResult).toEqual(mockDietaryPreferences);
    expect(secondResult).toEqual(mockDietaryPreferences);
    httpMock.expectNone('/api/nutrition/preferences/dietary-preferences');
  });

  it('should handle allergen fetch errors gracefully', () => {
    let errorOccurred = false;
    
    service.getAllergens().subscribe({
      next: () => {},
      error: () => {
        errorOccurred = true;
      }
    });

    const req = httpMock.expectOne('/api/nutrition/preferences/allergens');
    req.error(new ErrorEvent('Network error'));
    
    expect(errorOccurred).toBe(true);
  });

  it('should handle dietary preference fetch errors gracefully', () => {
    let errorOccurred = false;
    
    service.getDietaryPreferences().subscribe({
      next: () => {},
      error: () => {
        errorOccurred = true;
      }
    });

    const req = httpMock.expectOne('/api/nutrition/preferences/dietary-preferences');
    req.error(new ErrorEvent('Network error'));
    
    expect(errorOccurred).toBe(true);
  });

  it('should return observable with shareReplay operator', () => {
    const allergens$ = service.getAllergens();
    expect(allergens$).toBeTruthy();

    const req = httpMock.expectOne('/api/nutrition/preferences/allergens');
    req.flush(mockAllergens);
  });
});
