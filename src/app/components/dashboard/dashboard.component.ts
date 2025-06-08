import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ServiceFolderComponent } from './service-folder/service-folder.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ServiceFolderComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  logout() {
    this.apiService.removeTokens();
    this.router.navigateByUrl('/login');
  }
} 