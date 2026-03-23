import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ManagerLayoutComponent } from './manager-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { LoginResponse } from '../../../shared/models/models';

const mockUser: LoginResponse = {
  token: 'fake-token',
  type: 'Bearer',
  id: 2,
  name: 'Sales Manager',
  email: 'mgr@salescrm.com',
  role: 'ROLE_SALES_MANAGER'
};

describe('ManagerLayoutComponent', () => {
  let component: ManagerLayoutComponent;
  let fixture: ComponentFixture<ManagerLayoutComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    spy.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [ManagerLayoutComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: spy }]
    }).compileComponents();

    authSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(ManagerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should get correct initials for multi-word name', () => {
    expect(component.getInitials()).toBe('SM');
  });

  it('should return fallback initials when user is null', () => {
    authSpy.getCurrentUser.and.returnValue(null);
    component.user = authSpy.getCurrentUser();
    expect(component.getInitials()).toBe('MG');
  });

  it('should call authService logout', () => {
    component.logout();
    expect(authSpy.logout).toHaveBeenCalled();
  });
});
