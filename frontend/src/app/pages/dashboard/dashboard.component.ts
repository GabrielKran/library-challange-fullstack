import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService, Book } from '../../services/books.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  books: Book[] = [];
  myReservations: any[] = [];
  
  private booksService = inject(BooksService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Carrega Livros
    this.booksService.getBooks().subscribe(data => {
      this.books = data;
      this.cdr.detectChanges();
    });

    // 2. Carrega Minhas Reservas
    this.loadMyReservations();
  }

  loadMyReservations() {
    const myId = this.authService.currentUserId;
    
    this.booksService.getMyReservations().subscribe({
      next: (reservations) => {
        this.myReservations = reservations.filter(res => 
          res.user.id === myId && res.status === 'ACTIVE'
        );
        this.cdr.detectChanges();
      }
    });
  }

  reserve(book: Book) {
    const userId = this.authService.currentUserId;
    if (!userId) return;

    this.booksService.reserveBook(book.id, userId).subscribe({
      next: () => {
        this.toastr.success(`Você reservou "${book.title}"!`);
        this.loadData(); // Recarrega tudo para atualizar as listas
      },
      error: (err) => {
        this.toastr.error('Erro ao reservar. Talvez já esteja alugado.');
      }
    });
  }

  returnBook(reservationId: string) {
    this.booksService.returnBook(reservationId).subscribe({
      next: (res: any) => {
        // Mostra o valor da multa se houver
        if (res.fineToPay > 0) {
          this.toastr.warning(`Devolvido com Multa: R$ ${res.fineToPay}`, 'Atenção!');
        } else {
          this.toastr.success('Livro devolvido no prazo!', 'Obrigado');
        }
        this.loadData(); // Atualiza a tela
      },
      error: () => this.toastr.error('Erro na devolução')
    });
  }

  logout() {
    this.authService.logout();
  }

  // Controle do Modal
  showFineModal = false;
  selectedReservation: any = null;
  fineSimulation = 0;

  // Função auxiliar para verificar atraso visualmente
  isLate(dateString: string): boolean {
    return new Date(dateString) < new Date();
  }

  // Ação ao clicar em "Devolver"
  initiateReturn(reservation: any) {
    const dueDate = new Date(reservation.endDate);
    const now = new Date();

    if (now > dueDate) {
      // Calculamos uma estimativa rápida pra mostrar no modal
      const diffTime = Math.abs(now.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // Regra visual simples: 5 reais + (dias * 5%...) - Apenas estimativa visual
      this.fineSimulation = 5.00 + (diffDays * 0.25); 
      
      this.selectedReservation = reservation;
      this.showFineModal = true; // ABRE O MODAL
    } else {
      // Se não tiver multa, devolve direto
      this.confirmReturn(reservation.id);
    }
  }

  confirmReturn(reservationId: string) {
    this.booksService.returnBook(reservationId).subscribe({
      next: (res: any) => {
        this.toastr.success('Livro devolvido com sucesso!');
        this.closeModal();
        this.loadData();
      },
      error: () => this.toastr.error('Erro na devolução')
    });
  }

  closeModal() {
    this.showFineModal = false;
    this.selectedReservation = null;
  }
}