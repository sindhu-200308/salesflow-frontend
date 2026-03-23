import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ManagerDashboardComponent } from './manager-dashboard.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { ManagerStats } from '../../../shared/models/models';

const mockStats: ManagerStats = {
  assignedLeads: 30, newLeads: 8, contactedLeads: 10,
  interestedLeads: 6, convertedLeads: 4, rejectedLeads: 2,
  totalEmployees: 5, totalSales: 12
};

describe('ManagerDashboardComponent', () => {
  let component: ManagerDashboardComponent;
  let fixture: ComponentFixture<ManagerDashboardComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['getManagerDashboard']);
    spy.getManagerDashboard.and.returnValue(of(mockStats));

    await TestBed.configureTestingModule({
      imports: [ManagerDashboardComponent, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(ManagerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load stats on init', () => {
    expect(component.stats).toEqual(mockStats);
    expect(apiSpy.getManagerDashboard).toHaveBeenCalled();
  });

  it('should build 5 pipeline stages', () => {
    expect(component.pipeline.length).toBe(5);
  });

  it('should map pipeline values correctly', () => {
    const newStage = component.pipeline.find(p => p.label === 'New');
    expect(newStage?.value).toBe(8);
    const convertedStage = component.pipeline.find(p => p.label === 'Converted');
    expect(convertedStage?.value).toBe(4);
  });

  it('should include totalSales in stats', () => {
    expect(component.stats?.totalSales).toBe(12);
  });

  it('should have null stats before ngOnInit', () => {
    const fresh = new ManagerDashboardComponent(apiSpy);
    expect(fresh.stats).toBeNull();
    expect(fresh.pipeline.length).toBe(0);
  });
});
