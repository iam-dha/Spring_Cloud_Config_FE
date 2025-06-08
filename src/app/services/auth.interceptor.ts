import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const apiService = inject(ApiService);
  const router = inject(Router);

  console.log('👉 Intercepting request:', req.url);
  const accessToken = apiService.getAccessToken();
  console.log('👉 Access token:', accessToken);
  let request = req;

  // Skip token for login/refresh
  if (accessToken && !isAuthRequest(req)) {
    request = addTokenHeader(req, accessToken);
    console.log('✅ Authorization header added to request:', request.headers.get('Authorization'));
  }

  return next(request).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse) {
        // Handle both 401 and 403 errors
        if ((error.status === 401 || error.status === 403) && !isAuthRequest(req)) {
          console.log('❌ Authentication error detected:', error.status);
          return handleAuthError(request, next, apiService, router);
        }
      }
      return throwError(() => error);
    })
  );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}

function isAuthRequest(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
}

function handleAuthError(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  apiService: ApiService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = apiService.getRefreshToken();
    console.log('🔄 Attempting to refresh token...');
    
    if (refreshToken) {
      return apiService.refreshToken(refreshToken).pipe(
        switchMap((response: any) => {
          console.log('✅ Token refresh successful');
          isRefreshing = false;
          
          if (response.success && response.data) {
            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;
            apiService.setTokens(newAccessToken, newRefreshToken);
            refreshTokenSubject.next(newAccessToken);
            
            // Retry the original request with new token
            return next(addTokenHeader(request, newAccessToken));
          } else {
            throw new Error('Token refresh failed');
          }
        }),
        catchError((err) => {
          console.log('❌ Token refresh failed:', err);
          isRefreshing = false;
          apiService.removeTokens();
          router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      console.log('❌ No refresh token available');
      isRefreshing = false;
      apiService.removeTokens();
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => {
      console.log('🔄 Retrying request with new token');
      return next(addTokenHeader(request, token!));
    })
  );
}