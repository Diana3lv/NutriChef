import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { STORAGE_KEYS } from '../../constants/storage-keys';

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

  currentStep = signal(1);
  totalSteps = 3;
  isSaving = signal(false);

  allergies = [
    { key: 'nuts', label: 'Nuts' },
    { key: 'peanuts', label: 'Peanuts' },
    { key: 'shellfish', label: 'Shellfish' },
    { key: 'fish', label: 'Fish' },
    { key: 'dairy', label: 'Dairy' },
    { key: 'eggs', label: 'Eggs' },
    { key: 'soy', label: 'Soy' },
    { key: 'wheat', label: 'Wheat' }
  ];

  dietaryPreferences = [
    { key: 'vegetarian', label: 'Vegetarian' },
    { key: 'vegan', label: 'Vegan' },
    { key: 'pescatarian', label: 'Pescatarian' },
    { key: 'keto', label: 'Keto' },
    { key: 'paleo', label: 'Paleo' },
    { key: 'glutenFree', label: 'Gluten-Free' },
    { key: 'dairyFree', label: 'Dairy-Free' },
    { key: 'lowCarb', label: 'Low-Carb' }
  ];

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
    // TODO: save to backend when API is ready

    const healthProfile = this.form.value;
    localStorage.setItem('healthProfile', JSON.stringify(healthProfile));
    sessionStorage.removeItem(STORAGE_KEYS.pendingOnboarding);
    this.router.navigate(['/home']);
  }
}
