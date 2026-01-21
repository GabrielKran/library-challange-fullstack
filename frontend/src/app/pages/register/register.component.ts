import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink], 
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Inicializa os dados vazios
  data = { name: '', email: '', cpf: '', password: '' };
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  onCpfInput(event: any) {
    let valor = event.target.value;

    valor = valor.replace(/\D/g, '');

    if (valor.length > 11) {
      valor = valor.substring(0, 11);
    }

    if (valor.length <= 11) {
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
    this.data.cpf = valor;
    event.target.value = valor;
  }

  onRegister() {
    if (!this.data.name || !this.data.email || !this.data.password) {
      this.toastr.warning('Preencha todos os campos obrigatórios');
      return;
    }

    if (this.data.cpf.length !== 14) {
      this.toastr.warning('O CPF deve conter 14 caracteres.');
      return;
    }

    const payload = {
        ...this.data,
        cpf: this.data.cpf
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.toastr.success('Conta criada com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const mensagem = err.error?.message || 'Erro ao criar conta';
        this.toastr.error(mensagem);
      }
    });
  }
}