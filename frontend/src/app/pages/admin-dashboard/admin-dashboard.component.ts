import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { BooksService } from '../../services/books.service'; 
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  activeTab: 'RESERVATIONS' | 'BOOKS' | 'USERS' = 'RESERVATIONS';
  
  reservations: any[] = [];
  books: any[] = [];
  users: any[] = [];

  showBookModal = false;
  showDeleteModal = false;
  
  isEditing = false;
  // Inicializa com campos vazios
  bookForm: any = { id: '', title: '', author: '', description: '', imageUrl: '' };
  
  itemToDelete: any = null;
  deleteType: 'BOOK' | 'USER' = 'BOOK';

  private adminService = inject(AdminService);
  private booksService = inject(BooksService);
  public authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadReservations();
    this.loadBooks();
    this.loadUsers();
  }

  // === RESERVAS ===
  loadReservations() {
    this.adminService.getAllReservations().subscribe({
      next: (res) => {
        this.reservations = res.sort((a, b) => {
          const priorityA = this.getPriority(a);
          const priorityB = this.getPriority(b);
          if (priorityA !== priorityB) return priorityA - priorityB;
          return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        });
        this.cdr.detectChanges();
      }
    });
  }

  getPriority(res: any): number {
    if (res.status === 'COMPLETED') return 3;
    if (this.isLate(res.endDate)) return 1;
    return 2;
  }

  returnBook(reservation: any) {
    this.adminService.returnBook(reservation.id).subscribe({
      next: (res) => {
        const msg = res.fineToPay > 0 ? `Devolvido com Multa: R$ ${res.fineToPay}` : 'Livro devolvido.';
        this.toastr.info(msg);
        this.loadReservations();
        this.loadBooks(); 
      },
      error: () => this.toastr.error('Erro na devolução')
    });
  }

  // === LIVROS ===
  loadBooks() {
    this.booksService.getBooks().subscribe(res => {
      this.books = res;
      this.cdr.detectChanges();
    });
  }

  openNewBookModal() {
    this.isEditing = false;
    this.bookForm = { id: '', title: '', author: '', description: '', imageUrl: '' };
    this.showBookModal = true;
  }

  openEditBookModal(book: any) {
    this.isEditing = true;
    this.bookForm = { ...book }; // Clona tudo (incluindo lixo que não vamos enviar)
    this.showBookModal = true;
  }

  submitBook() {
    if(!this.bookForm.title || !this.bookForm.author) {
      this.toastr.warning('Preencha Título e Autor.');
      return;
    }

    // === LIMPEZA DE PAYLOAD (A CORREÇÃO) ===
    // Criamos um objeto LIMPO apenas com o que o DTO do backend aceita.
    // Ignoramos 'isAvailable', 'createdAt', 'id' (no body), etc.
    const cleanPayload = {
        title: this.bookForm.title,
        author: this.bookForm.author,
        description: this.bookForm.description,
        imageUrl: this.bookForm.imageUrl
    };

    let request$;
    
    if (this.isEditing) {
      // Update: Passa ID na URL e payload limpo no body
      request$ = this.adminService.updateBook(this.bookForm.id, cleanPayload);
    } else {
      // Create: Passa payload limpo (backend define isAvailable=true)
      request$ = this.adminService.createBook(cleanPayload);
    }

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditing ? 'Livro atualizado!' : 'Livro criado!');
        this.showBookModal = false;
        this.loadBooks();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        const msg = err.error?.message || 'Erro ao salvar.';
        this.toastr.error(Array.isArray(msg) ? msg[0] : msg);
      }
    });
  }

  // === DELETE ===
  confirmDeleteBook(book: any) {
    this.itemToDelete = book;
    this.deleteType = 'BOOK';
    this.showDeleteModal = true;
  }

  confirmDeleteUser(user: any) {
    this.itemToDelete = user;
    this.deleteType = 'USER';
    this.showDeleteModal = true;
  }

  executeDelete() {
    const finalize = () => {
      this.showDeleteModal = false;
      this.cdr.detectChanges();
    };

    if (this.deleteType === 'BOOK') {
      this.adminService.deleteBook(this.itemToDelete.id).subscribe({
        next: () => {
          this.toastr.success('Livro removido.');
          this.loadBooks();
          finalize();
        },
        error: () => {
          this.toastr.error('Erro: Talvez tenha reservas ativas.');
        }
      });
    } else {
      this.adminService.deleteUser(this.itemToDelete.id).subscribe({
        next: () => {
          this.toastr.success('Usuário removido.');
          this.loadUsers();
          finalize();
        },
        error: (err) => {
          if(err.status === 400) this.toastr.warning('Usuário tem livros pendentes.');
          else this.toastr.error('Erro ao deletar usuário.');
        }
      });
    }
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.cdr.detectChanges();
      }
    });
  }

  isLate(date: string): boolean { return new Date(date) < new Date(); }
}