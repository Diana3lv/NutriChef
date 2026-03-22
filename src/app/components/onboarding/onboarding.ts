import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { UserService } from '../../services/user.service';
import { ALLERGY_OPTIONS, DIETARY_PREFERENCE_OPTIONS } from '../../constants/nutrition-profile-options';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export class Onboarding {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  currentStep = signal(1);
  totalSteps = 3;
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  allergies = ALLERGY_OPTIONS;

  dietaryPreferences = DIETARY_PREFERENCE_OPTIONS;

  form: FormGroup = this.fb.group({
    allergies: this.fb.group(
      this.allergies.reduce((acc, item) => ({ ...acc, [item.key]: [false] }), {})
    ),
    dietaryPreferences: this.fb.group(
      this.dietaryPreferences.reduce((acc, item) => ({ ...acc, [item.key]: [false] }), {})
    ),
    medicalConditions: ['']
  });

  get stepTitles() {
    return ['Allergies', 'Dietary Preferences', 'Medical Conditions'];
  }

  get stepDescriptions() {
    return [
      'Select any food allergies you have we should be aware of',
      'Choose your dietary preferences to help us personalize your experience',
      'Share any medical conditions or food intolerances we should be aware of'
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
    const selectedAllergens = this.allergies
      .filter(option => formValue.allergies?.[option.key])
      .map(option => option.apiValue);

    const selectedDietaryPreferences = this.dietaryPreferences
      .filter(option => formValue.dietaryPreferences?.[option.key])
      .map(option => option.apiValue);

    return {
      allergens: selectedAllergens,
      dietaryPreferences: selectedDietaryPreferences,
      medicalConditions: formValue.medicalConditions ?? ''
    };
  }
}
