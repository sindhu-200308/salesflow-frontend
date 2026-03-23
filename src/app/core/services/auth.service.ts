import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, LoginResponse, RoleType } from '../../shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  getRole(): RoleType | null {
    return this.getCurrentUser()?.role ?? null;
  }

  isAdmin(): boolean { return this.getRole() === 'ROLE_ADMIN'; }
  isManager(): boolean { return this.getRole() === 'ROLE_SALES_MANAGER'; }
  isEmployee(): boolean { return this.getRole() === 'ROLE_SALES_EMPLOYEE'; }

  getDashboardRoute(): string {
    switch (this.getRole()) {
      case 'ROLE_ADMIN': return '/admin/dashboard';
      case 'ROLE_SALES_MANAGER': return '/manager/dashboard';
      case 'ROLE_SALES_EMPLOYEE': return '/employee/dashboard';
      default: return '/login';
    }
  }

  private getStoredUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
