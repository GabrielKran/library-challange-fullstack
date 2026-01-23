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

    // 2. Validação de Formato (Economiza requisição)
    if (this.password.length < 6) {
      this.toastr.warning('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // 3. O Envio
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.toastr.success('Bem-vindo de volta!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Erro detalhado:', err); // <--- AJUDA NO DEBUG

        // 4. Tratamento Inteligente de Erros do NestJS
        if (err.status === 401) {
          // Erro jogado pelo AuthService (Credenciais erradas)
          this.toastr.error('Email ou senha incorretos.');
        } 
        else if (err.status === 400) {
          // Erro jogado pelo ValidationPipe (DTO) ou Regra de Negócio
          // O Nest geralmente devolve: { message: ["password too short", ...], ... }
          const messages = err.error?.message;
          
          if (Array.isArray(messages)) {
            // Se for array de erros de validação, mostra o primeiro
            this.toastr.warning(messages[0]); 
          } else {
            // Se for mensagem única
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