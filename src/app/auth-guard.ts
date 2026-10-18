import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { auth } from './app.config';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // 1. Check if user is logged in via AuthService state / localStorage
  if (authService.isLoggedIn()) {
    return true;
  }

  // 2. Check if Firebase user is already authenticated
  if (auth.currentUser) {
    return true;
  }

  // 3. Not logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
