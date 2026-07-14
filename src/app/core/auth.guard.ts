import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Builds a route guard that intercepts the navigation cycle for unauthenticated
 * or under-privileged users and redirects them before the guarded route ever activates.
 */
function roleGuard(role?: 'admin'): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn) {
      return router.createUrlTree(['/login']);
    }

    if (role === 'admin' && !authService.isAdmin) {
      return router.createUrlTree(['/dashboard']);
    }

    return true;
  };
}

/** Requires any signed-in member. */
export const authGuard: CanActivateFn = roleGuard();

/** Requires a signed-in member whose whitelist userType is Admin. */
export const adminGuard: CanActivateFn = roleGuard('admin');
