import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../services/auth.service';
import { UserService } from '../../services/user.service';

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
  
  user = this.authService.currentUser;
  isEditMode = signal(false);
  isChangingPassword = signal(false);
  isSaving = signal(false);
  isSavingHealthProfile = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  healthProfileForm!: FormGroup;

  // Health profile options
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

  ngOnInit() {
    this.initializeForms();
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

    // Load saved health profile from localStorage
    const savedHealthProfile = localStorage.getItem('healthProfile');
    const healthProfile = savedHealthProfile ? JSON.parse(savedHealthProfile) : {
      allergies: this.allergies.reduce((acc, item) => ({ ...acc, [item.key]: false }), {}),
      dietaryPreferences: this.dietaryPreferences.reduce((acc, item) => ({ ...acc, [item.key]: false }), {}),
      medicalConditions: ''
    };

    this.healthProfileForm = this.fb.group({
      allergies: this.fb.group(
        this.allergies.reduce((acc, item) => ({ ...acc, [item.key]: [healthProfile.allergies[item.key] || false] }), {})
      ),
      dietaryPreferences: this.fb.group(
        this.dietaryPreferences.reduce((acc, item) => ({ ...acc, [item.key]: [healthProfile.dietaryPreferences[item.key] || false] }), {})
      ),
      medicalConditions: [healthProfile.medicalConditions]
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  enableEditMode() {
    this.isEditMode.set(true);
    this.clearMessages();
  }

  cancelEdit() {
    this.isEditMode.set(false);
    this.initializeForms();
    this.clearMessages();
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
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: (user) => {
            this.authService.currentUser.set(user);
            this.isEditMode.set(false);
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
        .pipe(takeUntilDestroyed())
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

  saveHealthProfile() {
    if (this.healthProfileForm.valid) {
      this.isSavingHealthProfile.set(true);
      this.clearMessages();

      const healthProfile = this.healthProfileForm.value;

      // Simulare API call (pentru moment doar localStorage)
      setTimeout(() => {
        localStorage.setItem('healthProfile', JSON.stringify(healthProfile));
        this.isSavingHealthProfile.set(false);
        this.successMessage.set('Health profile saved successfully!');
        this.clearMessageAfterDelay();
      }, 500);
    }
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  private clearMessageAfterDelay() {
    setTimeout(() => this.clearMessages(), 3000);
  }
}
