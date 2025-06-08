import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  publicVisible: boolean;
  updatedAt: string;
  createdAt: string;
}

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.css']
})
export class ServiceDetailsComponent implements OnInit {
  service: ServiceDetails | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const serviceName = params['serviceName'];
      this.loadServiceDetails(serviceName);
    });
  }

  loadServiceDetails(serviceName: string) {
    this.isLoading = true;
    this.errorMessage = '';

    // For now, we'll find the service from the list
    // Later, we'll implement a proper API endpoint to get service details
    this.apiService.getServices().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const service = response.data.find((s: any) => s.name === serviceName);
          if (service) {
            this.service = service;
          } else {
            this.errorMessage = 'Service not found';
          }
        } else {
          this.errorMessage = response.desc || 'Failed to load service details';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.desc || 'Failed to load service details';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  viewProfiles() {
    if (this.service) {
      this.router.navigate(['/config', this.service.name, 'profiles']);
    }
  }
} 