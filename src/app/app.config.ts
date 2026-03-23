import { ApplicationConfig } from '@angular/core';
import { provideRouter, Routes, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authGuard, adminGuard, managerGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Root → redirect to login
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Login — loginGuard redirects logged-in users to their dashboard
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ─── ADMIN ROUTES ─────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/admin/leads/admin-leads.component').then(m => m.AdminLeadsComponent)
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/admin/customers/admin-customers.component').then(m => m.AdminCustomersComponent)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/admin/sales/admin-sales.component').then(m => m.AdminSalesComponent)
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/admin/employees/admin-employees.component').then(m => m.AdminEmployeesComponent)
      },
    ]
  },

  // ─── MANAGER ROUTES ───────────────────────────────────────
  {
    path: 'manager',
    canActivate: [authGuard, managerGuard],
    loadComponent: () =>
      import('./features/manager/manager-layout/manager-layout.component').then(m => m.ManagerLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/manager/dashboard/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/manager/leads/manager-leads.component').then(m => m.ManagerLeadsComponent)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/manager/sales/manager-sales.component').then(m => m.ManagerSalesComponent)
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/manager/employees/manager-employees.component').then(m => m.ManagerEmployeesComponent)
      },
    ]
  },

  // ─── EMPLOYEE ROUTES ──────────────────────────────────────
  {
    path: 'employee',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employee/employee-layout/employee-layout.component').then(m => m.EmployeeLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/employee/dashboard/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'leads',
        loadComponent: () =>
          import('./features/employee/leads/employee-leads.component').then(m => m.EmployeeLeadsComponent)
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/employee/sales/employee-sales.component').then(m => m.EmployeeSalesComponent)
      },
    ]
  },

  // Unknown routes → login
  { path: '**', redirectTo: '/login' }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations()
  ]
};
