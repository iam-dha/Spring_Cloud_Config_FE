import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfoComponent implements OnInit {
  user: any = null;
  loading = true;
  error: string | null = null;
  showApiKey = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getUserInfo().subscribe({
      next: (res) => {
        this.user = res.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Không thể lấy thông tin tài khoản';
        this.loading = false;
      }
    });
  }

  toggleApiKey() {
    this.showApiKey = !this.showApiKey;
  }
} 