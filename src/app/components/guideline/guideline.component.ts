import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guideline',
  standalone: true,
  templateUrl: './guideline.component.html',
  styleUrls: ['./guideline.component.css']
})
export class GuidelineComponent {
  constructor(private router: Router) {}

  navigateToHomepage() {
    this.router.navigateByUrl('/dashboard');
  }
} 