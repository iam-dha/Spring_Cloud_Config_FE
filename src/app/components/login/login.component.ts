import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  account: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  onSubmit() {
    if (!this.account || !this.password) {
      this.errorMessage = 'Please enter both account and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login({ account: this.account, password: this.password })
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.apiService.setTokens(
              response.data.accessToken,
              response.data.refreshToken
            );
            localStorage.setItem('account', this.account);
            this.router.navigateByUrl('/dashboard');
          } else {
            this.errorMessage = response.desc || 'Login failed';
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
          if (error.error) {
            this.errorMessage = error.error.desc || 'Invalid account or password';
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  navigateToSignup() {
    this.router.navigateByUrl('/signup');
  }
} 