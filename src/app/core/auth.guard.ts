import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn ? true : router.createUrlTree(['/login']);
};

/** Restricts a route to signed-in members whose whitelist userType is Admin. */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }

  return authService.isAdmin ? true : router.createUrlTree(['/dashboard']);
};
