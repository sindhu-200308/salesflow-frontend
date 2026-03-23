import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ManagerLeadsComponent } from './manager-leads.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Lead, User } from '../../../shared/models/models';

const mockLead: Lead = {
  id: 1, name: 'Test Lead', email: 'test@lead.com', phone: '9999999999',
  company: 'TestCo', source: 'LinkedIn', notes: '', status: 'NEW',
  createdAt: '2024-01-01', updatedAt: '2024-01-01'
};
const mockEmployee: User = {
  id: 5, name: 'Emp One', email: 'emp@test.com',
  phone: '8888888888', role: 'ROLE_SALES_EMPLOYEE', active: true, createdAt: ''
};

describe('ManagerLeadsComponent', () => {
  let component: ManagerLeadsComponent;
  let fixture: ComponentFixture<ManagerLeadsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getManagerLeads', 'getManagerEmployees',
      'assignLeadToEmployee', 'managerUpdateLeadStatus', 'getFollowUpsForLead'
    ]);
    spy.getManagerLeads.and.returnValue(of([mockLead]));
    spy.getManagerEmployees.and.returnValue(of([mockEmployee]));
    spy.assignLeadToEmployee.and.returnValue(of({ ...mockLead, assignedEmployee: mockEmployee }));
    spy.managerUpdateLeadStatus.and.returnValue(of({ ...mockLead, status: 'CONTACTED' }));
    spy.getFollowUpsForLead.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ManagerLeadsComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(ManagerLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load leads and employees on init', () => {
    expect(component.leads.length).toBe(1);
    expect(component.employees.length).toBe(1);
  });

  it('should filter leads by search term', () => {
    component.searchTerm = 'Test';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.searchTerm = 'zzz';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should filter leads by status', () => {
    component.statusFilter = 'NEW';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.statusFilter = 'CONVERTED';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should open assign modal', () => {
    component.openAssign(mockLead);
    expect(component.showAssignModal).toBeTrue();
    expect(component.selected).toEqual(mockLead);
  });

  it('should open status modal with current status', () => {
    component.openStatus(mockLead);
    expect(component.showStatusModal).toBeTrue();
    expect(component.newStatus).toBe('NEW');
  });

  it('should open follow-ups modal', () => {
    component.openFollowUps(mockLead);
    expect(apiSpy.getFollowUpsForLead).toHaveBeenCalledWith(1);
    expect(component.showFollowUpsModal).toBeTrue();
  });

  it('should close all modals', () => {
    component.showAssignModal = true;
    component.showStatusModal = true;
    component.showFollowUpsModal = true;
    component.closeAll();
    expect(component.showAssignModal).toBeFalse();
    expect(component.showStatusModal).toBeFalse();
    expect(component.showFollowUpsModal).toBeFalse();
    expect(component.selected).toBeNull();
  });

  it('should assign employee and update lead list', () => {
    component.selected = mockLead;
    component.selectedEmployeeId = 5;
    component.assignEmployee();
    expect(apiSpy.assignLeadToEmployee).toHaveBeenCalledWith(1, 5);
    expect(component.leads[0].assignedEmployee?.name).toBe('Emp One');
  });

  it('should update lead status', () => {
    component.selected = mockLead;
    component.newStatus = 'CONTACTED';
    component.updateStatus();
    expect(apiSpy.managerUpdateLeadStatus).toHaveBeenCalledWith(1, 'CONTACTED');
    expect(component.leads[0].status).toBe('CONTACTED');
  });
});
