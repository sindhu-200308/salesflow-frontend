import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EmployeeLeadsComponent } from './employee-leads.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Lead } from '../../../shared/models/models';

const mockLead: Lead = {
  id: 1, name: 'Lead One', email: 'lead@one.com', phone: '9999999999',
  company: 'TestCo', source: 'Website', notes: '', status: 'NEW',
  createdAt: '2024-01-01', updatedAt: '2024-01-01'
};

describe('EmployeeLeadsComponent', () => {
  let component: EmployeeLeadsComponent;
  let fixture: ComponentFixture<EmployeeLeadsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getMyLeads', 'updateMyLeadStatus',
      'convertLeadToCustomer', 'addFollowUp', 'getFollowUpsForLead'
    ]);
    spy.getMyLeads.and.returnValue(of([mockLead]));
    spy.updateMyLeadStatus.and.returnValue(of({ ...mockLead, status: 'CONTACTED' }));
    spy.convertLeadToCustomer.and.returnValue(of({ id: 10, name: 'Lead One', email: 'lead@one.com', phone: '', company: '', address: '', createdAt: '' }));
    spy.addFollowUp.and.returnValue(of({ id: 1, leadId: 1, leadName: 'Lead One', notes: 'Called', createdAt: '', createdBy: { id: 1, name: 'Emp', email: '', phone: '', role: 'ROLE_SALES_EMPLOYEE', active: true, createdAt: '' } }));
    spy.getFollowUpsForLead.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [EmployeeLeadsComponent, HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(EmployeeLeadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load leads on init', () => {
    expect(component.leads.length).toBe(1);
    expect(component.leads[0].name).toBe('Lead One');
  });

  it('should filter leads by search term', () => {
    component.searchTerm = 'Lead';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.searchTerm = 'zzz';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should filter by status', () => {
    component.statusFilter = 'NEW';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.statusFilter = 'CONVERTED';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should return correct status icon', () => {
    expect(component.statusIcon('NEW')).toBe('🆕');
    expect(component.statusIcon('CONTACTED')).toBe('📞');
    expect(component.statusIcon('INTERESTED')).toBe('💡');
    expect(component.statusIcon('CONVERTED')).toBe('✅');
    expect(component.statusIcon('REJECTED')).toBe('❌');
  });

  it('should open status modal with current status', () => {
    component.openStatus(mockLead);
    expect(component.showStatusModal).toBeTrue();
    expect(component.newStatus).toBe('NEW');
  });

  it('should open follow-up modal', () => {
    component.openFollowUp(mockLead);
    expect(component.showFollowUpModal).toBeTrue();
    expect(component.selectedLead).toEqual(mockLead);
  });

  it('should open view follow-ups modal', () => {
    component.viewFollowUps(mockLead);
    expect(apiSpy.getFollowUpsForLead).toHaveBeenCalledWith(1);
    expect(component.showViewFollowUpsModal).toBeTrue();
  });

  it('should open convert modal', () => {
    component.convertLead(mockLead);
    expect(component.showConvertModal).toBeTrue();
    expect(component.selectedLead).toEqual(mockLead);
  });

  it('should update lead status', () => {
    component.selectedLead = mockLead;
    component.newStatus = 'CONTACTED';
    component.updateStatus();
    expect(apiSpy.updateMyLeadStatus).toHaveBeenCalledWith(1, 'CONTACTED');
    expect(component.leads[0].status).toBe('CONTACTED');
  });

  it('should add follow-up when form is valid', () => {
    component.selectedLead = mockLead;
    component.followUpForm.patchValue({ notes: 'Called the lead', followUpDate: '', outcome: '' });
    component.addFollowUp();
    expect(apiSpy.addFollowUp).toHaveBeenCalled();
  });

  it('should not add follow-up when form is invalid', () => {
    component.selectedLead = mockLead;
    component.followUpForm.reset();
    component.addFollowUp();
    expect(apiSpy.addFollowUp).not.toHaveBeenCalled();
  });

  it('should confirm conversion and update lead status', () => {
    component.selectedLead = mockLead;
    component.confirmConvert();
    expect(apiSpy.convertLeadToCustomer).toHaveBeenCalledWith(1);
    expect(component.leads[0].status).toBe('CONVERTED');
  });

  it('should close all modals', () => {
    component.showStatusModal = true;
    component.showFollowUpModal = true;
    component.showConvertModal = true;
    component.closeAll();
    expect(component.showStatusModal).toBeFalse();
    expect(component.showFollowUpModal).toBeFalse();
    expect(component.showConvertModal).toBeFalse();
  });
});
