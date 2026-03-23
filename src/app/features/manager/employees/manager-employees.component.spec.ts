import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ManagerEmployeesComponent } from './manager-employees.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { User, Lead } from '../../../shared/models/models';

const mockEmployee: User = {
  id: 1, name: 'John Employee', email: 'john@emp.com',
  phone: '9999999999', role: 'ROLE_SALES_EMPLOYEE', active: true, createdAt: ''
};

const mockLeads: Lead[] = [
  { id: 1, name: 'Lead A', email: 'a@b.com', phone: '', company: '', source: '', notes: '', status: 'NEW',       createdAt: '', updatedAt: '' },
  { id: 2, name: 'Lead B', email: 'b@b.com', phone: '', company: '', source: '', notes: '', status: 'CONVERTED', createdAt: '', updatedAt: '' },
  { id: 3, name: 'Lead C', email: 'c@b.com', phone: '', company: '', source: '', notes: '', status: 'REJECTED',  createdAt: '', updatedAt: '' },
];

describe('ManagerEmployeesComponent', () => {
  let component: ManagerEmployeesComponent;
  let fixture: ComponentFixture<ManagerEmployeesComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getManagerEmployees', 'getEmployeeLeads']);
    spy.getManagerEmployees.and.returnValue(of([mockEmployee]));
    spy.getEmployeeLeads.and.returnValue(of(mockLeads));

    await TestBed.configureTestingModule({
      imports: [ManagerEmployeesComponent, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(ManagerEmployeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load employees on init', () => {
    expect(component.employees.length).toBe(1);
    expect(component.employees[0].name).toBe('John Employee');
  });

  it('should open modal and load leads when viewLeads is called', () => {
    component.viewLeads(mockEmployee);
    expect(apiSpy.getEmployeeLeads).toHaveBeenCalledWith(1);
    expect(component.showLeadsModal).toBeTrue();
    expect(component.empLeads.length).toBe(3);
  });

  it('should calculate per-status stats correctly', () => {
    component.viewLeads(mockEmployee);
    const newStat      = component.empStats.find(s => s.label === 'New');
    const convertedStat = component.empStats.find(s => s.label === 'Converted');
    const rejectedStat  = component.empStats.find(s => s.label === 'Rejected');
    expect(newStat?.count).toBe(1);
    expect(convertedStat?.count).toBe(1);
    expect(rejectedStat?.count).toBe(1);
  });

  it('should close modal and reset state', () => {
    component.viewLeads(mockEmployee);
    component.closeModal();
    expect(component.showLeadsModal).toBeFalse();
    expect(component.selectedEmployee).toBeNull();
    expect(component.empLeads.length).toBe(0);
  });
});
