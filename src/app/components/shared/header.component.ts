import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    setTimeout(() => this.menuOpen = false, 150);
  }

  logout(event: Event) {
    event.preventDefault();
    this.apiService.removeTokens();
    this.router.navigateByUrl('/login');
  }

  navigateToHomepage() {
    this.router.navigateByUrl('/dashboard');
  }
} 