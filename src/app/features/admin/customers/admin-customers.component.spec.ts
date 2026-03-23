import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminCustomersComponent } from './admin-customers.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Customer } from '../../../shared/models/models';

const mockCustomer: Customer = {
  id: 1, name: 'Acme Corp', email: 'acme@corp.com',
  phone: '1234567890', company: 'Acme', address: '123 Main St', createdAt: ''
};

describe('AdminCustomersComponent', () => {
  let component: AdminCustomersComponent;
  let fixture: ComponentFixture<AdminCustomersComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'adminGetAllCustomers', 'adminCreateCustomer', 'adminUpdateCustomer', 'adminDeleteCustomer'
    ]);
    spy.adminGetAllCustomers.and.returnValue(of([mockCustomer]));
    spy.adminCreateCustomer.and.returnValue(of(mockCustomer));
    spy.adminUpdateCustomer.and.returnValue(of(mockCustomer));
    spy.adminDeleteCustomer.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminCustomersComponent, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load customers on init', () => {
    expect(component.customers.length).toBe(1);
    expect(component.filtered.length).toBe(1);
  });

  it('should filter customers by name', () => {
    component.searchTerm = 'Acme';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.searchTerm = 'NotExist';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should filter customers by email', () => {
    component.searchTerm = 'acme@corp';
    component.filter();
    expect(component.filtered.length).toBe(1);
  });

  it('should open create modal', () => {
    component.openCreateModal();
    expect(component.showModal).toBeTrue();
    expect(component.editing).toBeNull();
  });

  it('should open edit modal with customer data', () => {
    component.openEditModal(mockCustomer);
    expect(component.showModal).toBeTrue();
    expect(component.editing).toEqual(mockCustomer);
    expect(component.form.get('name')?.value).toBe('Acme Corp');
  });

  it('should delete customer with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteCustomer(1);
    expect(apiSpy.adminDeleteCustomer).toHaveBeenCalledWith(1);
  });

  it('should not delete without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteCustomer(1);
    expect(apiSpy.adminDeleteCustomer).not.toHaveBeenCalled();
  });

  it('should close modal', () => {
    component.showModal = true;
    component.closeModal();
    expect(component.showModal).toBeFalse();
    expect(component.editing).toBeNull();
  });
});
