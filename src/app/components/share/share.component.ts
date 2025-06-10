import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import * as YAML from 'yaml';

interface Entry {
  id: string;
  key: string;
  value: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface SharedConfig {
  account: string;
  service: string;
  profile: string;
  entries: Entry[];
  lastUpdated: string;
}

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  config: SharedConfig | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  displayFormat: 'key-value' | 'json' | 'yaml' = 'key-value';
  copySuccess: boolean = false;
  private copyTimeout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const account = params['account'];
      const service = params['service'];
      const profile = params['profile'];
      this.loadSharedConfig(account, service, profile);
    });
  }

  loadSharedConfig(account: string, service: string, profile: string) {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getSharedConfig(account, service, profile).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.config = {
            account,
            service,
            profile,
            entries: response.data,
            lastUpdated: response.data[0]?.updatedAt || ''
          };
        } else {
          this.errorMessage = response.desc || 'Failed to load shared configuration';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.desc || 'Failed to load shared configuration';
        this.isLoading = false;
      }
    });
  }

  private createNestedMap(entries: Entry[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    entries.forEach(entry => {
      const keys = entry.key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (i === keys.length - 1) {
          current[key] = entry.value;
        } else {
          current[key] = current[key] || {};
          current = current[key];
        }
      }
    });
    
    return result;
  }

  getFormattedPreview(): string {
    if (!this.config?.entries) return '';
    
    switch (this.displayFormat) {
      case 'json':
        const jsonObj = this.createNestedMap(this.config.entries);
        return JSON.stringify(jsonObj, null, 2);
      
      case 'yaml':
        const yamlObj = this.createNestedMap(this.config.entries);
        return YAML.stringify(yamlObj);
      
      default:
        return '';
    }
  }

  copyKeyValueContent() {
    if (!this.config?.entries) return;
    
    const content = this.config.entries
      .map(entry => `${entry.key}=${entry.value}`)
      .join('\n');
    
    this.copyToClipboard(content);
  }

  copyPreviewContent() {
    const content = this.getFormattedPreview();
    this.copyToClipboard(content);
  }

  private copyToClipboard(content: string) {
    navigator.clipboard.writeText(content).then(() => {
      this.copySuccess = true;
      if (this.copyTimeout) {
        clearTimeout(this.copyTimeout);
      }
      this.copyTimeout = setTimeout(() => {
        this.copySuccess = false;
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy content:', err);
    });
  }

  ngOnDestroy() {
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }
  }
} 