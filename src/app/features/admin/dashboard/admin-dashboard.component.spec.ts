import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { AdminStats } from '../../../shared/models/models';

const mockStats: AdminStats = {
  totalLeads: 50, newLeads: 10, contactedLeads: 15,
  interestedLeads: 8, convertedLeads: 12, rejectedLeads: 5,
  totalCustomers: 12, totalProducts: 8, totalEmployees: 6, totalManagers: 2,
  totalSales: 20, totalRevenue: 99980
};

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getAdminDashboard']);
    spy.getAdminDashboard.and.returnValue(of(mockStats));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load stats on init', () => {
    expect(apiSpy.getAdminDashboard).toHaveBeenCalled();
    expect(component.stats).toEqual(mockStats);
  });

  it('should build pipeline with 5 stages', () => {
    expect(component.pipeline.length).toBe(5);
  });

  it('should set pipeline values from stats', () => {
    const newStage = component.pipeline.find(p => p.label === 'New');
    expect(newStage?.value).toBe(10);
    const convertedStage = component.pipeline.find(p => p.label === 'Converted');
    expect(convertedStage?.value).toBe(12);
  });

  it('should include sales stats', () => {
    expect(component.stats?.totalSales).toBe(20);
    expect(component.stats?.totalRevenue).toBe(99980);
  });

  it('should have null stats before init', () => {
    const fresh = new AdminDashboardComponent(apiSpy);
    expect(fresh.stats).toBeNull();
  });
});
