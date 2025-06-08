import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logo-container">
      <img 
        src="assets/spring-cloud-logo.png" 
        alt="Spring Cloud Logo" 
        class="logo-image"
        (click)="navigateToHomepage()"
      >
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }
    .logo-image {
      height: 60px;
      cursor: pointer;
      transition: transform 0.3s ease;
    }
    .logo-image:hover {
      transform: scale(1.05);
    }
  `]
})
export class LogoComponent {
  constructor(private router: Router) {}

  navigateToHomepage() {
    this.router.navigate(['/dashboard']);
  }
} 