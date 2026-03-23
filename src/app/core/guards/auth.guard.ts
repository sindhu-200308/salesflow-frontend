import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ✅ Protects routes that require login
// Redirects to /login if not authenticated
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login']);
};

// ✅ Protects Admin-only routes
// Redirects to role dashboard if not admin
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

// ✅ Protects Manager routes (Admin can also access)
export const managerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAdmin() || auth.isManager()) return true;
  return router.createUrlTree([auth.getDashboardRoute()]);
};

// ✅ Prevents logged-in users from seeing login page
// Redirects to their dashboard if already authenticated
export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return true;              // not logged in → show login page
  return router.createUrlTree([auth.getDashboardRoute()]); // logged in → go to dashboard
};
