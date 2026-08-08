import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Builds a guard that redirects to login when signed out, or dashboard when signed in but unauthorized. */
function roleGuard(allowed: (authService: AuthService) => boolean): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn) {
      return router.createUrlTree(['/login']);
    }

    return allowed(authService) ? true : router.createUrlTree(['/dashboard']);
  };
}

/** Restricts a route to signed-in members whose whitelist userType is Admin. */
export const adminGuard: CanActivateFn = roleGuard((authService) => authService.isAdmin);

/** Restricts a route to Admin or Scholarship members. */
export const scholarshipGuard: CanActivateFn = roleGuard((authService) => authService.canViewScholarApplied);

/** Restricts a route to Admin or Finance members. */
export const financeGuard: CanActivateFn = roleGuard((authService) => authService.canViewFinance);

/** Restricts a route to Admin, Finance, or Scholarship members. */
export const upcomingEventsGuard: CanActivateFn = roleGuard((authService) => authService.canViewUpdatesMenu);
