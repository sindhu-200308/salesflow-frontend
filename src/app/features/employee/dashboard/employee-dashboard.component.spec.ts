import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EmployeeDashboardComponent } from './employee-dashboard.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { EmployeeStats } from '../../../shared/models/models';

const mockStats: EmployeeStats = {
  assignedLeads: 20, newLeads: 5, contactedLeads: 7,
  interestedLeads: 4, convertedLeads: 3, rejectedLeads: 1,
  totalFollowUps: 12,
  totalSales: 8, myRevenue: 39992
};

describe('EmployeeDashboardComponent', () => {
  let component: EmployeeDashboardComponent;
  let fixture: ComponentFixture<EmployeeDashboardComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getEmployeeDashboard']);
    spy.getEmployeeDashboard.and.returnValue(of(mockStats));

    await TestBed.configureTestingModule({
      imports: [EmployeeDashboardComponent, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(EmployeeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load stats on init', () => {
    expect(component.stats).toEqual(mockStats);
    expect(apiSpy.getEmployeeDashboard).toHaveBeenCalled();
  });

  it('should calculate conversion rate correctly', () => {
    expect(component.conversionRate).toBe(15); // 3/20 = 15%
  });

  it('should calculate rejection rate correctly', () => {
    expect(component.rejectionRate).toBe(5); // 1/20 = 5%
  });

  it('should show sales stats', () => {
    expect(component.stats?.totalSales).toBe(8);
    expect(component.stats?.myRevenue).toBe(39992);
  });

  it('should handle zero assigned leads without division error', () => {
    apiSpy.getEmployeeDashboard.and.returnValue(of({ ...mockStats, assignedLeads: 0 }));
    component.ngOnInit();
    expect(component.conversionRate).toBe(0);
    expect(component.rejectionRate).toBe(0);
  });
});
