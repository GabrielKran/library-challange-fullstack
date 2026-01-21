import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

@Injectable({ providedIn: 'root' })
export class BooksService {
  private apiUrl = 'http://localhost:3000';
  private http = inject(HttpClient);

  getBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.apiUrl}/books`);
  }

  // Fazer Reserva
  reserveBook(bookId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, { userId, bookId });
  }

  // Pegar minhas reservas (Filtro no front por enquanto)
  getMyReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations`);
  }
  
  // Devolver Livro
  returnBook(reservationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations/${reservationId}/return`, {});
  }
}