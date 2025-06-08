import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { LogoComponent } from '../../shared/logo.component';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, LogoComponent],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css']
})
export class VerifyOtpComponent {
  otp: string = '';
  email: string = '';
  username: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  resendDisabled: boolean = false;
  resendCountdown: number = 0;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {
    // Get email and username from state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.email = navigation.extras.state['email'];
      this.username = navigation.extras.state['username'];
    } else {
      // If no state, redirect back to signup
      this.router.navigate(['/signup']);
    }
  }

  onSubmit() {
    if (!this.otp) {
      this.errorMessage = 'Please enter the OTP';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.verifyOtp(this.username, this.otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data?.token) {
          // Navigate to complete registration with the verification token
          this.router.navigate(['/signup/complete-registration'], {
            state: {
              email: this.email,
              username: this.username,
              token: response.data.token
            }
          });
        } else {
          this.errorMessage = response.desc || 'Failed to verify OTP';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to verify OTP. Please try again.';
      }
    });
  }

  resendOtp() {
    if (this.resendDisabled) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.resendOtp(this.username).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.startResendCountdown();
        } else {
          this.errorMessage = response.desc || 'Failed to resend OTP';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to resend OTP. Please try again.';
      }
    });
  }

  private startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 60;
    const timer = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(timer);
        this.resendDisabled = false;
      }
    }, 1000);
  }
} 