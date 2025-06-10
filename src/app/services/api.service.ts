import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface LoginRequest {
  account: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
}

export interface AuthResponse {
  status: number;
  desc: string;
  data: {
    accessToken: string;
    refreshToken: string;
    roles: string[];
  };
  success: boolean;
}

export interface VerifyOtpResponse {
  status: number;
  desc: string;
  data: {
    token: string;
  };
  success: boolean;
}

export interface CompleteRegistrationRequest {
  email: string;
  password: string;
  account: string;
  token: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  phoneNumber: string;
}

interface ApiResponse<T> {
  success: boolean;
  desc: string;
  data?: T;
}

interface ServiceData {
  name: string;
  description: string;
  publicVisible: string;
}

export interface Entry {
  id: string | null;
  key: string;
  value: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EntriesResponse {
  status: number;
  desc: string;
  data: Entry[];
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('account', credentials.account);
    formData.append('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, formData);
  }

  // Signup - Register OTP
  signup(userData: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/registerOtp`, {
      account: userData.username,
      email: userData.email
    });
  }

  // Verify OTP
  verifyOtp(account: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(`${this.baseUrl}/auth/verOtp`, {
      account,
      otp: parseInt(otp)
    });
  }

  // Complete registration
  completeRegistration(data: CompleteRegistrationRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, data);
  }

  // Resend OTP
  resendOtp(account: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/resendOtp`, {
      account
    });
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, {
      refreshToken: refreshToken
    }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // Get user profile
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/profile`, {
      headers: this.getHeaders()
    });
  }

  // Store tokens in localStorage
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  // Get access token from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // Get refresh token from localStorage
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  // Remove tokens from localStorage
  removeTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  // Get all services
  getServices(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/config/services`, {
      headers: this.getHeaders()
    });
  }

  createService(serviceData: ServiceData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/config/services`, serviceData, {
      headers: this.getHeaders()
    });
  }

  // Get profiles for a specific service
  getServiceProfiles(serviceName: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/config/services/${serviceName}/profiles`, {
      headers: this.getHeaders()
    });
  }

  createProfile(serviceName: string, profileName: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/config/services/${serviceName}/profiles`,
      { name: profileName },
      { headers: this.getHeaders() }
    );
  }

  deleteProfile(serviceName: string, profileName: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}/config/services/${serviceName}/profiles/${profileName}`,
      { headers: this.getHeaders() }
    );
  }

  updateProfile(serviceName: string, oldProfileName: string, newProfileName: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(
      `${this.baseUrl}/config/services/${serviceName}/profiles/${oldProfileName}`,
      { name: newProfileName },
      { headers: this.getHeaders() }
    );
  }

  getEntries(serviceName: string, profileName: string): Observable<Entry[]> {
    return this.http.get<EntriesResponse>(`${this.baseUrl}/config/services/${serviceName}/profiles-entries/${profileName}`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  updateEntries(serviceName: string, profileName: string, entries: Entry[]): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/config/services/${serviceName}/profiles-entries/${profileName}`,
      entries,
      { headers: this.getHeaders() }
    );
  }

  getUserInfo() {
    return this.http.get<any>(`${this.baseUrl}/user`, {
      headers: this.getHeaders()
    });
  }

  updateService(serviceName: string, data: { name: string; description: string; publicVisible: string }): Observable<any> {
    return this.http.patch(`${this.baseUrl}/config/services/${serviceName}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteService(serviceName: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/config/services/${serviceName}`, {
      headers: this.getHeaders()
    });
  }

  getSharedConfig(account: string, service: string, profile: string): Observable<ApiResponse<any>> {
    const url = `${this.baseUrl}/share/${account}/${service}/${profile}`;
    return this.http.get<ApiResponse<any>>(url, { headers: this.getHeaders() });
  }
}