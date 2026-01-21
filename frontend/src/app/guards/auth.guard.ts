import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userId = localStorage.getItem('user_id');

  if (userId) {
    return true; // Passa
    
  } else {
    router.navigate(['/login']);
    return false; // Barrado
  }
};