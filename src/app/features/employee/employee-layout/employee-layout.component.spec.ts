import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EmployeeLayoutComponent } from './employee-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../shared/models/models';

const mockUser: LoginResponse = {
  token: 'fake-token',
  type: 'Bearer',
  id: 3,
  name: 'Sales Employee',
  email: 'emp@salescrm.com',
  role: 'ROLE_SALES_EMPLOYEE'
};

describe('EmployeeLayoutComponent', () => {
  let component: EmployeeLayoutComponent;
  let fixture: ComponentFixture<EmployeeLayoutComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    spy.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [EmployeeLayoutComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(EmployeeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should return correct two-letter initials', () => {
    expect(component.getInitials()).toBe('SE');
  });

  it('should return fallback initials when user is null', () => {
    authSpy.getCurrentUser.and.returnValue(null);
    component.user = authSpy.getCurrentUser();
    expect(component.getInitials()).toBe('SE');
  });

  it('should call authService logout', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
  });
});
