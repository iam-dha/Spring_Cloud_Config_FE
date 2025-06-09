import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

interface Profile {
  name: string;
  createdAt: string;
  updatedAt: string;
  addedAt: string;
}

interface NewProfile {
  name: string;
}

@Component({
  selector: 'app-service-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-profile.component.html',
  styleUrls: ['./service-profile.component.css']
})
export class ServiceProfileComponent implements OnInit {
  serviceName: string = '';
  profiles: Profile[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  showEditModal: boolean = false;
  profileToDelete: Profile | null = null;
  profileToEdit: Profile | null = null;
  newProfileName: string = '';
  newProfile: NewProfile = {
    name: ''
  };
  notification: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.serviceName = params['serviceName'];
      this.loadProfiles();
    });
  }

  loadProfiles() {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Replace with actual API call when endpoint is available
    this.apiService.getServiceProfiles(this.serviceName).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profiles = response.data;
        } else {
          this.errorMessage = response.desc || 'Failed to load profiles';
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.log('Interceptor caught error:', error);

        if (
          error.status === 401 &&
          error.error &&
          (error.error.message === 'Access token expired' || error.error.desc === 'Access token expired')
        ) {
          console.log('Triggering refresh token logic...');
          // ... rest of your logic
        }
        this.errorMessage = error.error?.desc || 'Failed to load profiles';
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  viewProfileDetails(profile: Profile) {
    this.router.navigate(['/config', this.serviceName, 'profiles', profile.name, 'entries']);
  }

  openCreateProfileModal() {
    this.showModal = true;
    this.errorMessage = '';
    this.newProfile = { name: '' };
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
  }

  createProfile() {
    if (!this.newProfile.name.trim()) {
      this.errorMessage = 'Profile name is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Replace with actual API call when endpoint is available
    this.apiService.createProfile(this.serviceName, this.newProfile.name).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeModal();
          this.loadProfiles();
        } else {
          this.errorMessage = response.desc || 'Failed to create profile';
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.desc || 'Failed to create profile';
        this.isLoading = false;
      }
    });
  }

  confirmDelete(profile: Profile) {
    this.profileToDelete = profile;
    this.showDeleteModal = true;
    this.errorMessage = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.profileToDelete = null;
    this.errorMessage = '';
  }

  deleteProfile() {
    if (!this.profileToDelete) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.deleteProfile(this.serviceName, this.profileToDelete.name).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeDeleteModal();
          this.loadProfiles();
        } else {
          this.errorMessage = response.desc || 'Failed to delete profile';
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.desc || 'Failed to delete profile';
        this.isLoading = false;
      }
    });
  }

  openEditModal(profile: Profile) {
    this.profileToEdit = profile;
    this.newProfileName = profile.name;
    this.showEditModal = true;
    this.errorMessage = '';
  }

  closeEditModal() {
    this.showEditModal = false;
    this.profileToEdit = null;
    this.newProfileName = '';
    this.errorMessage = '';
  }

  updateProfile() {
    if (!this.profileToEdit || !this.newProfileName.trim()) {
      this.errorMessage = 'New profile name is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.updateProfile(
      this.serviceName,
      this.profileToEdit.name,
      this.newProfileName
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeEditModal();
          this.loadProfiles();
        } else {
          this.errorMessage = response.desc || 'Failed to update profile';
        }
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.desc || 'Failed to update profile';
        this.isLoading = false;
      }
    });
  }

  saveApiUrl(profile: Profile, event: Event) {
    event.stopPropagation(); // Prevent event bubbling to parent elements
    const account = localStorage.getItem('account');
    if (!account) {
      this.errorMessage = 'Account information not found. Please log in again.';
      return;
    }
    const baseUrl = 'http://54.87.12.126:8080';
    const apiUrl = `${baseUrl}/${this.serviceName}/${profile.name}`;
    localStorage.setItem('lastApiUrl', apiUrl);
    // Copy to clipboard
    navigator.clipboard.writeText(apiUrl).then(() => {
      this.notification = 'API URL copied to clipboard!';
      setTimeout(() => {
        this.notification = null;
      }, 2000);
    }).catch(err => {
      this.errorMessage = 'Failed to copy URL to clipboard';
      console.error('Failed to copy URL:', err);
    });
  }
} 