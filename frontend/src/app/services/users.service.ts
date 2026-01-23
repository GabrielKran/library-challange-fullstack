import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private apiUrl = 'http://localhost:3000/users';
  private http = inject(HttpClient);

  getProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  update(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  delete(id: string, password: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      body: { password }
    });
  }
}