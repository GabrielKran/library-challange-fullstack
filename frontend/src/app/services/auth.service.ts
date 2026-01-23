import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private http = inject(HttpClient);
  private router = inject(Router);

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_id', response.user.id);
        localStorage.setItem('user_name', response.user.name);
        localStorage.setItem('user_role', response.user.role);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  get currentUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }
}