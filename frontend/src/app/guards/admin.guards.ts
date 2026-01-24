import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role'); // Vamos garantir que isso exista no login

  if (token && role === 'ADMIN') {
    return true; 
  } else {
    // Se tentar acessar e não for admin, chuta pra dashboard comum ou login
    router.navigate(['/dashboard']); 
    return false;
  }
};