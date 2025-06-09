import { Component, OnInit, Directive, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Entry } from '../../../services/api.service';
import * as YAML from 'yaml';

@Directive({
  selector: 'textarea[autoResize]',
  standalone: true
})
export class AutoResizeDirective {
  constructor(private elementRef: ElementRef) {}

  @HostListener('input')
  onInput() {
    this.resize();
  }

  @HostListener('ngModelChange')
  onModelChange() {
    this.resize();
  }

  private resize() {
    const textarea = this.elementRef.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}

@Component({
  selector: 'app-service-entries',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoResizeDirective],
  templateUrl: './service-entries.component.html',
  styleUrls: ['./service-entries.component.css']
})
export class ServiceEntriesComponent implements OnInit {
  serviceName: string = '';
  profileName: string = '';
  entries: Entry[] = [];
  loading: boolean = true;
  error: string | null = null;
  isSubmitting: boolean = false;
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
      this.serviceName = params['serviceName'];
      this.profileName = params['profileName'];
      this.loadEntries();
    });
  }

  loadEntries() {
    this.loading = true;
    this.error = null;
    this.apiService.getEntries(this.serviceName, this.profileName)
      .subscribe({
        next: (data) => {
          this.entries = data;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to load entries';
          this.loading = false;
          console.error('Error loading entries:', error);
        }
      });
  }

  addNewEntry() {
    this.entries.push({
      id: '',
      key: '',
      value: '',
      type: 'STRING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  removeEntry(index: number) {
    this.entries.splice(index, 1);
  }

  onSubmit() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    const entriesToUpdate = this.entries.map(entry => ({
      id: entry.id || null,
      key: entry.key.trim(),
      value: entry.value.trim(),
      type: entry.type || 'STRING'
    }));

    this.apiService.updateEntries(this.serviceName, this.profileName, entriesToUpdate)
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.loadEntries(); // Reload entries after successful update
        },
        error: (error) => {
          this.error = 'Failed to update entries';
          this.isSubmitting = false;
          console.error('Error updating entries:', error);
        }
      });
  }

  goBack() {
    this.router.navigate(['/config', this.serviceName, 'profiles']);
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
    switch (this.displayFormat) {
      case 'json':
        const jsonObj = this.createNestedMap(this.entries);
        return JSON.stringify(jsonObj, null, 2);
      
      case 'yaml':
        const yamlObj = this.createNestedMap(this.entries);
        return YAML.stringify(yamlObj);
      
      default:
        return '';
    }
  }

  copyKeyValueContent() {
    const content = this.entries
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

  onEntryChange(index: number) {
    // Trigger change detection to update form
    this.entries = [...this.entries];
  }
} 