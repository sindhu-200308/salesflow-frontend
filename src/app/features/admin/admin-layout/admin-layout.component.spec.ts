import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../shared/models/models';

const mockUser: LoginResponse = {
  token: 'fake-token',
  type: 'Bearer',
  id: 1,
  name: 'Admin User',
  email: 'admin@salescrm.com',
  role: 'ROLE_ADMIN'
};

describe('AdminLayoutComponent', () => {
  let component: AdminLayoutComponent;
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    spy.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct initials from two-word name', () => {
    expect(component.getInitials()).toBe('AU');
  });

  it('should return initials for single-word name', () => {
    authServiceSpy.getCurrentUser.and.returnValue({
      token: '', type: 'Bearer', id: 1,
      name: 'Admin', email: 'a@b.com', role: 'ROLE_ADMIN'
    });
    component.user = authServiceSpy.getCurrentUser();
    expect(component.getInitials().length).toBeGreaterThan(0);
  });

  it('should return fallback initials when user is null', () => {
    authServiceSpy.getCurrentUser.and.returnValue(null);
    component.user = authServiceSpy.getCurrentUser();
    expect(component.getInitials()).toBe('AD');
  });

  it('should call logout on authService', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
