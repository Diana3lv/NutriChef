import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { UserService } from '../../services/user.service';
import { NutritionProfileOptionsService, HealthOption } from '../../services/nutrition-profile-options.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private allergenService = inject(NutritionProfileOptionsService);
  private destroyRef = inject(DestroyRef);

  currentStep = signal(1);
  totalSteps = 3;
  isSaving = signal(false);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  allergiesError = signal<string | null>(null);
  dietaryPreferencesError = signal<string | null>(null);

  allergies = signal<HealthOption[]>([]);
  dietaryPreferences = signal<HealthOption[]>([]);

  form!: FormGroup;

  ngOnInit() {
    // Initialize form immediately with empty FormGroups to prevent undefined errors
    this.form = this.fb.group({
      allergies: this.fb.group({}),
      dietaryPreferences: this.fb.group({}),
      medicalConditions: [''],
      intolerances: ['']
    });

    // Use combineLatest to ensure BOTH options are loaded before proceeding
    combineLatest([
      this.allergenService.getAllergens(),
      this.allergenService.getDietaryPreferences()
    ]).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([allergens, preferences]) => {
          this.allergies.set(allergens);
          this.dietaryPreferences.set(preferences);
          this.allergiesError.set(null);
          this.dietaryPreferencesError.set(null);
          this.updateAllergiesFormGroup();
          this.updateDietaryPreferencesFormGroup();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load options:', err);
          this.allergiesError.set('Failed to load allergen options');
          this.dietaryPreferencesError.set('Failed to load dietary preference options');
          this.isLoading.set(false);
        }
      });
  }

  private updateAllergiesFormGroup() {
    const allergiesFormGroup = this.fb.group(
      this.allergies().reduce((acc, item) => ({ ...acc, [item.apiValue]: [false] }), {})
    );
    this.form.setControl('allergies', allergiesFormGroup);
  }

  private updateDietaryPreferencesFormGroup() {
    const dietaryPreferencesFormGroup = this.fb.group(
      this.dietaryPreferences().reduce((acc, item) => ({ ...acc, [item.apiValue]: [false] }), {})
    );
    this.form.setControl('dietaryPreferences', dietaryPreferencesFormGroup);
  }

  get stepTitles() {
    return ['Allergies', 'Dietary Preferences', 'Health Profile'];
  }

  get stepDescriptions() {
    return [
      'Select any food allergies you have we should be aware of',
      'Choose your dietary preferences to help us personalize your experience',
      'Share any medical conditions and food intolerances we should be aware of'
    ];
  }
  
  skip() {
    sessionStorage.removeItem(STORAGE_KEYS.pendingOnboarding);
    this.router.navigate(['/home']);
  }

  next() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  previous() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  finish() {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.userService.updateNutritionProfile(this.toApiPayload())
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          sessionStorage.removeItem(STORAGE_KEYS.pendingOnboarding);
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.isSaving.set(false);
          this.errorMessage.set(error.error?.error || 'Failed to save nutrition profile');
        }
      });
  }

  private toApiPayload() {
    const formValue = this.form.value;
    const selectedAllergens = this.allergies()
      .filter(option => formValue.allergies?.[option.apiValue])
      .map(option => option.apiValue);

    const selectedDietaryPreferences = this.dietaryPreferences()
      .filter(option => formValue.dietaryPreferences?.[option.apiValue])
      .map(option => option.apiValue);

    return {
      allergens: selectedAllergens,
      dietaryPreferences: selectedDietaryPreferences,
      medicalConditions: formValue.medicalConditions ?? '',
      intolerances: formValue.intolerances ?? ''
    };
  }
}
