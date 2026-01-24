import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BooksService, Book } from '../../services/books.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  books: Book[] = [];
  myReservations: any[] = [];
  
  isSidebarOpen = false;
  userProfile: any = null;
  
  // 'NONE', 'NAME', 'EMAIL', 'PASSWORD', 'DELETE' ou 'FINE' (Multa)
  activeModal: string = 'NONE';

  formData = {
    currentPassword: '',
    newName: '',
    newEmail: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  private usersService = inject(UsersService);
  private booksService = inject(BooksService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadData();
    this.loadUserProfile();
    
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

  loadUserProfile() {
    const userId = this.authService.currentUserId;
    if (userId) {
      this.usersService.getProfile(userId).subscribe({
        next: (u) => {
          this.userProfile = u;
          this.cdr.detectChanges();
        },
        error: () => this.toastr.error('Erro ao carregar perfil')
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openModal(type: string) {
    this.activeModal = type;
    this.isSidebarOpen = false; // Fecha a sidebar ao abrir um modal
    // Reseta o formulário
    this.formData = {
      currentPassword: '',
      newName: this.userProfile?.name || '',
      newEmail: this.userProfile?.email || '',
      newPassword: '',
      confirmNewPassword: ''
    };
  }

  closeAllModals() {
    this.activeModal = 'NONE';
    this.showFineModal = false; // Garante que o de multa fecha também se usar a mesma lógica
  }

  // Função genérica para enviar as edições
  submitUpdate() {
    const userId = this.authService.currentUserId;
    if (!userId) return;

    if (!this.formData.currentPassword) {
      this.toastr.warning('Senha atual é obrigatória.');
      return;
    }

    let payload: any = { currentPassword: this.formData.currentPassword };

    if (this.activeModal === 'NAME') payload.name = this.formData.newName;
    if (this.activeModal === 'EMAIL') payload.email = this.formData.newEmail;
    if (this.activeModal === 'PASSWORD') {
      if (this.formData.newPassword !== this.formData.confirmNewPassword) {
        this.toastr.error('Senhas não conferem.');
        return;
      }
      payload.password = this.formData.newPassword;
    }

    this.usersService.update(userId, payload).subscribe({
      next: () => {
        this.toastr.success('Atualizado com sucesso!');
        this.loadUserProfile(); // Atualiza os dados na sidebar
        this.closeAllModals();  // <--- FECHA O MODAL AO SUCESSO

        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) this.toastr.error('Senha atual incorreta.');
        else if (err.status === 409) this.toastr.error('Email já existe.');
        else this.toastr.error('Erro ao atualizar.');

        this.cdr.detectChanges();
      }
    });
  }

  submitDelete() {
    const userId = this.authService.currentUserId;
    if (!userId || !this.formData.currentPassword) {
        this.toastr.warning('Digite sua senha para confirmar.');
        return;
    }

    this.usersService.delete(userId, this.formData.currentPassword).subscribe({
        next: () => {
            this.toastr.success('Conta excluída.');
            this.authService.logout();
        },
        error: (err) => {
            if(err.status === 400) this.toastr.warning(err.error.message); // Livros pendentes
            else this.toastr.error('Erro ao excluir ou senha incorreta.');
        }
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