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
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  onLogin() {
    if (!this.email.trim()) {
      this.toastr.warning('Por favor, digite um e-mail.');
      return;
    }

    this.authService.login(this.email).subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Login realizado com sucesso!');
          this.router.navigate(['/dashboard']);
        } else {
          this.toastr.error('Usuário não encontrado.', 'Acesso Negado');
        }
      },
      error: (err) => {
        console.error('Erro no login:', err);
        this.toastr.error('Erro de conexão com o servidor API.');
      }
    });
  }
}