import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  protected readonly title = signal('frontend');

  constructor() {
    // Enforce session validity on app bootstrap (e.g., after backend restart).
    if (this.auth.getToken()) {
      this.auth.validateCurrentSession().subscribe((isValid) => {
        if (!isValid) {
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
