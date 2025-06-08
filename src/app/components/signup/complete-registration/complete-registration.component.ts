import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './complete-registration.component.html',
  styleUrls: ['./complete-registration.component.css']
})
export class CompleteRegistrationComponent {
  email: string = '';
  username: string = '';
  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  firstName: string = '';
  lastName: string = '';
  birthDate: string = '';
  phoneNumber: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    // Get email, username and token from state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
      this.username = navigation.extras.state['username'];
      this.token = navigation.extras.state['token'];
    } else {
      // If no state, redirect back to signup
      this.router.navigate(['/signup']);
    }
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registrationData = {
      email: this.email,
      password: this.password,
      account: this.username,
      token: this.token,
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      phoneNumber: this.phoneNumber
    };

    this.apiService.completeRegistration(registrationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data?.accessToken) {
          // Store the tokens
          this.apiService.setTokens(
            response.data.accessToken,
            response.data.refreshToken
          );
          // Store the account (username)
          localStorage.setItem('account', this.username);
          // Navigate to dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.desc || 'Failed to complete registration';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to complete registration. Please try again.';
      }
    });
  }

  private validateForm(): boolean {
    if (!this.password || !this.confirmPassword || !this.firstName || 
        !this.lastName || !this.birthDate || !this.phoneNumber) {
      this.errorMessage = 'Please fill in all fields';
      return false;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(this.phoneNumber)) {
      this.errorMessage = 'Please enter a valid 10-digit phone number';
      return false;
    }

    return true;
  }
} 