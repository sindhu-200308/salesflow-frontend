import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['login', 'isLoggedIn', 'getDashboardRoute']);
    spy.isLoggedIn.and.returnValue(false);
    spy.getDashboardRoute.and.returnValue('/admin/dashboard');

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty form', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should be invalid when form is empty', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should be invalid with wrong email format', () => {
    component.loginForm.patchValue({ email: 'notanemail', password: 'pass123' });
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('should be valid with correct credentials', () => {
    component.loginForm.patchValue({ email: 'admin@salescrm.com', password: 'admin123' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should fill demo credentials', () => {
    component.fillDemo('admin@salescrm.com', 'admin123');
    expect(component.loginForm.get('email')?.value).toBe('admin@salescrm.com');
    expect(component.loginForm.get('password')?.value).toBe('admin123');
  });

  it('should call login on submit with valid form', () => {
    authServiceSpy.login.and.returnValue(of({
      token: 'fake-token', type: 'Bearer', id: 1,
      name: 'Admin', email: 'admin@salescrm.com', role: 'ROLE_ADMIN'
    }));
    component.loginForm.patchValue({ email: 'admin@salescrm.com', password: 'admin123' });
    component.onSubmit();
    expect(authServiceSpy.login).toHaveBeenCalled();
  });

  it('should show error on failed login', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: 'Invalid credentials' })));
    component.loginForm.patchValue({ email: 'wrong@email.com', password: 'wrongpass' });
    component.onSubmit();
    expect(component.error).toBe('Invalid credentials');
    expect(component.loading).toBeFalse();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });
});
