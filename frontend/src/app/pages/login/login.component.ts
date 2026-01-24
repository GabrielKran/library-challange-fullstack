import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  onLogin() {
    // 1. Validação de Preenchimento Básico
    if (!this.email.trim() || !this.password.trim()) {
      this.toastr.warning('Por favor, preencha email e senha.');
      return;
    }

    // 2. Validação de Formato
    if (this.password.length < 6) {
      this.toastr.warning('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // 3. O Envio
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      // AQUI ESTÁ A MUDANÇA: Recebemos 'res' para ver quem é o usuário
      next: (res) => {
        this.toastr.success('Bem-vindo de volta!');

        // LÓGICA DE REDIRECIONAMENTO INTELIGENTE
        const role = res.user.role; // Pega a role que veio do backend
        
        if (role === 'ADMIN') {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Erro detalhado:', err);

        // 4. Tratamento de Erros (Mantive o seu que estava ótimo)
        if (err.status === 401) {
          this.toastr.error('Email ou senha incorretos.');
        } 
        else if (err.status === 400) {
          const messages = err.error?.message;
          if (Array.isArray(messages)) {
            this.toastr.warning(messages[0]); 
          } else {
            this.toastr.warning(messages || 'Dados inválidos.');
          }
        } 
        else {
          this.toastr.error('Erro de conexão ou servidor offline.');
        }
      }
    });
  }
}