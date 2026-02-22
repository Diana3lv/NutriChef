import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { Auth } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup;

  constructor(
    public authService: Auth,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validator for matching password and confirm password fields
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { firstName, lastName, email, password } = this.registerForm.value;
    await this.authService.register({ firstName, lastName, email, password });
  }

  get password() {
    return this.registerForm.get('password')?.value || '';
  }

  getPasswordRequirements() {
    const pwd = this.password;
    return [
      { text: 'Use 8 or more characters', met: pwd.length >= 8 },
      { text: 'Include at least one symbol (!@#$%^&*)', met: /[@$#!%*?&]/.test(pwd) },
      { text: 'Include at least one number', met: /\d/.test(pwd) },
      { text: 'Include uppercase and lowercase letters', met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) }
    ];
  }
}
