import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface ServiceFolder {
  id?: string;
  name: string;
  description: string;
  isPublic: boolean;
  updatedAt?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-service-folder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-folder.component.html',
  styleUrls: ['./service-folder.component.css']
})
export class ServiceFolderComponent implements OnInit {
  folders: ServiceFolder[] = [];
  formModel: ServiceFolder = {
    name: '',
    description: '',
    isPublic: false
  };
  errorMessage: string = '';
  isLoading: boolean = false;
  showModal: boolean = false;
  isEditing: boolean = false;
  editingIndex: number = -1;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchFolders();
  }

  fetchFolders() {
    this.apiService.getServices().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.folders = response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            isPublic: item.publicVisible,
            updatedAt: item.updatedAt,
            createdAt: item.createdAt
          }));
        } else {
          this.errorMessage = response.desc || 'Failed to fetch services';
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.desc || 'Failed to fetch services';
      }
    });
  }

  openModal() {
    this.isEditing = false;
    this.editingIndex = -1;
    this.showModal = true;
    this.errorMessage = '';
    this.formModel = {
      name: '',
      description: '',
      isPublic: false
    };
  }

  openEditModal(folder: ServiceFolder, index: number) {
    this.isEditing = true;
    this.editingIndex = index;
    this.showModal = true;
    this.errorMessage = '';
    this.formModel = { ...folder };
  }

  closeModal() {
    this.showModal = false;
    this.errorMessage = '';
    this.isLoading = false;
    this.isEditing = false;
    this.editingIndex = -1;
    this.formModel = {
      name: '',
      description: '',
      isPublic: false
    };
  }

  submitForm() {
    if (!this.formModel.name || !this.formModel.description) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const serviceData = {
      name: this.formModel.name,
      description: this.formModel.description,
      publicVisible: this.formModel.isPublic.toString()
    };

    if (this.isEditing) {
      this.apiService.updateService(
        this.formModel.name,
        {
          name: this.formModel.name,
          description: this.formModel.description,
          publicVisible: this.formModel.isPublic.toString()
        }
      ).subscribe({
        next: (response) => {
          if (response.success) {
            this.fetchFolders();
            this.closeModal();
          } else {
            this.errorMessage = response.desc || 'Failed to update service';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.desc || 'Failed to update service';
          this.isLoading = false;
        }
      });
    } else {
      this.apiService.createService(serviceData).subscribe({
        next: (response) => {
          if (response.success) {
            this.fetchFolders(); // Refresh the list
            this.closeModal();
          } else {
            this.errorMessage = response.desc || 'Failed to create service';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.desc || 'Failed to create service';
          this.isLoading = false;
        }
      });
    }
  }

  deleteFolder(index: number) {
    this.folders.splice(index, 1);
  }

  viewServiceDetails(folder: ServiceFolder) {
    this.router.navigate(['/config', folder.name]);
  }

  goToProfiles(folder: ServiceFolder, event: MouseEvent) {
    this.router.navigate(['/config', folder.name, 'profiles']);
  }
} 