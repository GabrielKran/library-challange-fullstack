import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private http = inject(HttpClient);
  private router = inject(Router);

  // Procura usuário com esse email no backend
  login(email: string): Observable<boolean> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(users => {
        const user = users.find(u => u.email === email);
        if (user) {
          // Salva no LocalStorage
          localStorage.setItem('user_id', user.id);
          localStorage.setItem('user_name', user.name);
          localStorage.setItem('user_role', user.role || 'CLIENT'); // Futuro admin
          return true;
        }
        return false;
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  get currentUserId(): string | null {
    return localStorage.getItem('user_id');
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserId;
  }
}