import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LogoComponent } from '../shared/logo.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  email: string = '';
  username: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  onSubmit() {
    if (!this.email || !this.username) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.signup({ email: this.email, username: this.username }).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Navigate to OTP verification page with email and username
        this.router.navigate(['/signup/verify-otp'], {
          state: {
            email: this.email,
            username: this.username
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to sign up. Please try again.';
      }
    });
  }
} 