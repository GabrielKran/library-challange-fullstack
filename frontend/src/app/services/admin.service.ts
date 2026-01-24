import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  // === LIVROS ===
  createBook(book: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/books`, book);
  }

  updateBook(id: string, book: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/books/${id}`, book);
  }

  deleteBook(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/books/${id}`);
  }

  // === RESERVAS ===
  getAllReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations`);
  }

  // === DEVOLUÇÃO MANUAL (Baixa) ===
  returnBook(reservationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations/${reservationId}/return`, {});
  }

  // USUARIOS
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}