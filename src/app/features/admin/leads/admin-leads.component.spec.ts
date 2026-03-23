import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminLeadsComponent } from './admin-leads.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Lead, User } from '../../../shared/models/models';

const mockLead: Lead = {
  id: 1, name: 'John Doe', email: 'john@test.com', phone: '9999999999',
  company: 'Acme', source: 'Website', notes: 'Test',
  status: 'NEW', createdAt: '', updatedAt: ''
};
const mockManager: User = {
  id: 10, name: 'Manager A', email: 'mgr@test.com',
  phone: '8888888888', role: 'ROLE_SALES_MANAGER', active: true, createdAt: ''
};

describe('AdminLeadsComponent', () => {
  let component: AdminLeadsComponent;
  let fixture: ComponentFixture<AdminLeadsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'adminGetAllLeads', 'getManagers', 'adminCreateLead',
      'adminUpdateLead', 'adminDeleteLead', 'assignLeadToManager'
    ]);
    spy.adminGetAllLeads.and.returnValue(of([mockLead]));
    spy.getManagers.and.returnValue(of([mockManager]));
    spy.adminCreateLead.and.returnValue(of(mockLead));
    spy.adminUpdateLead.and.returnValue(of(mockLead));
    spy.adminDeleteLead.and.returnValue(of({}));
    spy.assignLeadToManager.and.returnValue(of(mockLead));

    await TestBed.configureTestingModule({
      imports: [AdminLeadsComponent, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load leads on init', () => {
    expect(component.leads.length).toBe(1);
    expect(component.leads[0].name).toBe('John Doe');
  });

  it('should load managers on init', () => {
    expect(component.managers.length).toBe(1);
  });

  it('should filter leads by search term', () => {
    component.searchTerm = 'John';
    component.filterLeads();
    expect(component.filteredLeads.length).toBe(1);

    component.searchTerm = 'xyz';
    component.filterLeads();
    expect(component.filteredLeads.length).toBe(0);
  });

  it('should open create modal and reset form', () => {
    component.openCreateModal();
    expect(component.showFormModal).toBeTrue();
    expect(component.editingLead).toBeNull();
  });

  it('should open edit modal with lead data', () => {
    component.openEditModal(mockLead);
    expect(component.showFormModal).toBeTrue();
    expect(component.editingLead).toEqual(mockLead);
    expect(component.leadForm.get('name')?.value).toBe('John Doe');
  });

  it('should open assign modal', () => {
    component.openAssignModal(mockLead);
    expect(component.showAssignModal).toBeTrue();
    expect(component.assigningLead).toEqual(mockLead);
  });

  it('should close all modals', () => {
    component.showFormModal = true;
    component.showAssignModal = true;
    component.closeModals();
    expect(component.showFormModal).toBeFalse();
    expect(component.showAssignModal).toBeFalse();
  });

  it('should have invalid form when empty', () => {
    component.openCreateModal();
    expect(component.leadForm.invalid).toBeTrue();
  });

  it('should have valid form with required fields', () => {
    component.leadForm.patchValue({ name: 'Test', email: 'test@test.com' });
    expect(component.leadForm.valid).toBeTrue();
  });

  it('should call deleteLead with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteLead(1);
    expect(apiSpy.adminDeleteLead).toHaveBeenCalledWith(1);
  });

  it('should not delete without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteLead(1);
    expect(apiSpy.adminDeleteLead).not.toHaveBeenCalled();
  });
});
