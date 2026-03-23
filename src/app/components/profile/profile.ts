import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { ALLERGY_OPTIONS, DIETARY_PREFERENCE_OPTIONS } from '../../constants/nutrition-profile-options';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  private authService = inject(Auth);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  
  user = this.authService.currentUser;
  editingField = signal<string | null>(null);
  isChangingPassword = signal(false);
  isSaving = signal(false);
  isSavingNutritionProfile = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  nutritionProfileForm!: FormGroup;

  allergies = ALLERGY_OPTIONS;

  dietaryPreferences = DIETARY_PREFERENCE_OPTIONS;

  ngOnInit() {
    this.initializeForms();
    this.loadNutritionProfile();
  }

  private initializeForms() {
    const currentUser = this.user();

    this.profileForm = this.fb.group({
      firstName: [currentUser?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [currentUser?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: currentUser?.email || '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });

    this.nutritionProfileForm = this.fb.group({
      allergies: this.fb.group(
        this.allergies.reduce((acc, item) => ({ ...acc, [item.key]: [false] }), {})
      ),
      dietaryPreferences: this.fb.group(
        this.dietaryPreferences.reduce((acc, item) => ({ ...acc, [item.key]: [false] }), {})
      ),
      medicalConditions: [''],
      intolerances: ['']
    });
  }

  private loadNutritionProfile() {
    this.userService.getNutritionProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          const selectedAllergens = new Set(profile.allergens ?? []);
          const selectedDietaryPreferences = new Set(profile.dietaryPreferences ?? []);

          const allergyControls = this.allergies.reduce((acc, option) => ({
            ...acc,
            [option.key]: selectedAllergens.has(option.apiValue)
          }), {} as Record<string, boolean>);

          const dietaryControls = this.dietaryPreferences.reduce((acc, option) => ({
            ...acc,
            [option.key]: selectedDietaryPreferences.has(option.apiValue)
          }), {} as Record<string, boolean>);

          this.nutritionProfileForm.patchValue({
            allergies: allergyControls,
            dietaryPreferences: dietaryControls,
            medicalConditions: profile.medicalConditions ?? '',
            intolerances: profile.intolerances ?? ''
          });
        },
        error: () => {
          // Keep defaults when no profile data is available.
        }
      });
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  enableFieldEdit(fieldName: string) {
    this.editingField.set(fieldName);
    this.clearMessages();
  }

  cancelFieldEdit() {
    this.editingField.set(null);
    this.initializeForms();
    this.clearMessages();
  }

  isFieldEditing(fieldName: string): boolean {
    return this.editingField() === fieldName;
  }
  
  saveProfile() {
    if (this.profileForm.valid) {
      this.isSaving.set(true);
      this.clearMessages();

      const updateData = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName
      };

      this.userService.updateProfile(updateData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (user) => {
            this.authService.currentUser.set(user);
            this.editingField.set(null);
            this.isSaving.set(false);
            this.successMessage.set('Profile updated successfully!');
            this.clearMessageAfterDelay();
          },
          error: (error) => {
            this.isSaving.set(false);
            this.errorMessage.set(error.error?.message || 'Failed to update profile');
          }
        });
    }
  }

  togglePasswordForm() {
    this.isChangingPassword.set(!this.isChangingPassword());
    this.passwordForm.reset();
    this.clearMessages();
  }

  changePassword() {
    if (this.passwordForm.valid) {
      this.isSaving.set(true);
      this.clearMessages();

      const passwordData = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword
      };

      this.userService.changePassword(passwordData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isChangingPassword.set(false);
            this.isSaving.set(false);
            this.passwordForm.reset();
            this.successMessage.set('Password changed successfully!');
            this.clearMessageAfterDelay();
          },
          error: (error) => {
            this.isSaving.set(false);
            this.errorMessage.set(error.error?.message || 'Failed to change password');
          }
        });
    }
  }

  getMemberSince(): string {
    const user = this.user();
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return 'Recently';
  }

  getRoleBadgeClass(): string {
    return this.user()?.role === 'ADMIN' ? 'badge-admin' : 'badge-user';
  }

  saveNutritionProfile() {
    if (this.nutritionProfileForm.valid) {
      this.isSavingNutritionProfile.set(true);
      this.clearMessages();

      this.userService.updateNutritionProfile(this.toApiNutritionProfilePayload())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSavingNutritionProfile.set(false);
            this.successMessage.set('Nutrition profile saved successfully!');
            this.clearMessageAfterDelay();
          },
          error: (error) => {
            this.isSavingNutritionProfile.set(false);
            this.errorMessage.set(error.error?.error || 'Failed to save nutrition profile');
          }
        });
    }
  }

  private toApiNutritionProfilePayload() {
    const formValue = this.nutritionProfileForm.value;
    const allergens = this.allergies
      .filter(option => formValue.allergies?.[option.key])
      .map(option => option.apiValue);

    const dietaryPreferences = this.dietaryPreferences
      .filter(option => formValue.dietaryPreferences?.[option.key])
      .map(option => option.apiValue);

    return {
      allergens,
      dietaryPreferences,
      medicalConditions: formValue.medicalConditions ?? '',
      intolerances: formValue.intolerances ?? ''
    };
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  private clearMessageAfterDelay() {
    setTimeout(() => this.clearMessages(), 3000);
  }
}
