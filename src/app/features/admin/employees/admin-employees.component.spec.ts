import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminEmployeesComponent } from './admin-employees.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { User } from '../../../shared/models/models';

const mockUser: User = {
  id: 1, name: 'Jane Doe', email: 'jane@salescrm.com',
  phone: '9876543210', role: 'ROLE_SALES_EMPLOYEE', active: true, createdAt: ''
};

describe('AdminEmployeesComponent', () => {
  let component: AdminEmployeesComponent;
  let fixture: ComponentFixture<AdminEmployeesComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getAllEmployees', 'createEmployee', 'updateEmployee', 'deleteEmployee']);
    spy.getAllEmployees.and.returnValue(of([mockUser]));
    spy.createEmployee.and.returnValue(of(mockUser));
    spy.updateEmployee.and.returnValue(of(mockUser));
    spy.deleteEmployee.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminEmployeesComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load employees on init', () => {
    expect(component.employees.length).toBe(1);
    expect(component.employees[0].name).toBe('Jane Doe');
  });

  it('should get correct role badge class', () => {
    expect(component.getRoleBadge('ROLE_ADMIN')).toBe('badge-admin');
    expect(component.getRoleBadge('ROLE_SALES_MANAGER')).toBe('badge-manager');
    expect(component.getRoleBadge('ROLE_SALES_EMPLOYEE')).toBe('badge-employee');
  });

  it('should get human-readable role label', () => {
    expect(component.getRoleLabel('ROLE_SALES_MANAGER')).toBe('SALES MANAGER');
    expect(component.getRoleLabel('ROLE_SALES_EMPLOYEE')).toBe('SALES EMPLOYEE');
  });

  it('should open create modal with clean form', () => {
    component.openCreateModal();
    expect(component.showModal).toBeTrue();
    expect(component.editingUser).toBeNull();
  });

  it('should open edit modal with user data', () => {
    component.openEditModal(mockUser);
    expect(component.showModal).toBeTrue();
    expect(component.editingUser).toEqual(mockUser);
    expect(component.userForm.get('name')?.value).toBe('Jane Doe');
  });

  it('should close modal and reset state', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBeFalse();
    expect(component.editingUser).toBeNull();
  });

  it('should deactivate with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deactivate(1);
    expect(apiSpy.deleteEmployee).toHaveBeenCalledWith(1);
  });

  it('should not deactivate without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deactivate(1);
    expect(apiSpy.deleteEmployee).not.toHaveBeenCalled();
  });
});
