import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // 1. Check if mock user is logged in
  if (authService.isLoggedIn()) {
    return true;
  }

  // 2. Check if AWS Cognito user is logged in
  try {
    const session = await fetchAuthSession();
    if (session.tokens?.accessToken) {
      return true;
    }
  } catch (error) {
    console.debug('No active AWS Cognito session:', error);
  }

  // 3. Neither is logged in, redirect to login page
  router.navigate(['/login']);
  return false;
};
