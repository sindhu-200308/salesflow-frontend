import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ManagerSalesComponent } from './manager-sales.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Sale, SalesStats, EmployeeSalesSummary } from '../../../shared/models/models';

const mockStats: SalesStats = {
  totalSales: 5, completedSales: 4, pendingSales: 1, cancelledSales: 0,
  totalRevenue: 50000, monthlyRevenue: 25000, weeklyRevenue: 10000,
  topEmployees: [{ employeeId: 3, employeeName: 'Jane Sales', totalSales: 30000 }],
  topProducts:  [{ productId: 2, productName: 'Analytics Suite', totalQuantity: 5 }]
};

const mockSales: Sale[] = [
  {
    id: 1, customerId: 1, customerName: 'Beta Ltd', customerEmail: 'beta@ltd.com',
    customerCompany: 'Beta', employeeId: 3, employeeName: 'Jane Sales',
    items: [], totalAmount: 15000, status: 'COMPLETED',
    notes: '', createdAt: '2024-02-01T10:00:00', updatedAt: '2024-02-01T10:00:00'
  }
];

const mockSummary: EmployeeSalesSummary = {
  totalSales: 1, totalRevenue: 15000, completedSales: 1, pendingSales: 0
};

describe('ManagerSalesComponent', () => {
  let component: ManagerSalesComponent;
  let fixture: ComponentFixture<ManagerSalesComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getSalesStats', 'getSalesByEmployee', 'getEmployeeSalesSummary'
    ]);
    spy.getSalesStats.and.returnValue(of(mockStats));
    spy.getSalesByEmployee.and.returnValue(of(mockSales));
    spy.getEmployeeSalesSummary.and.returnValue(of(mockSummary));

    await TestBed.configureTestingModule({
      imports: [ManagerSalesComponent, HttpClientTestingModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(ManagerSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load sales stats on init', () => {
    expect(apiSpy.getSalesStats).toHaveBeenCalled();
    expect(component.stats).toEqual(mockStats);
  });

  it('should load employee sales and open modal on viewEmployeeSales', () => {
    component.viewEmployeeSales(3, 'Jane Sales');
    expect(apiSpy.getSalesByEmployee).toHaveBeenCalledWith(3);
    expect(apiSpy.getEmployeeSalesSummary).toHaveBeenCalledWith(3);
    expect(component.selectedEmployeeName).toBe('Jane Sales');
    expect(component.empSales).toEqual(mockSales);
    expect(component.empSummary).toEqual(mockSummary);
    expect(component.showSalesModal).toBeTrue();
  });

  it('should close modal and reset state', () => {
    component.showSalesModal = true;
    component.empSales = mockSales;
    component.empSummary = mockSummary;
    component.closeModal();
    expect(component.showSalesModal).toBeFalse();
    expect(component.empSales).toEqual([]);
    expect(component.empSummary).toBeNull();
  });

  it('should display correct stats data', () => {
    expect(component.stats?.totalRevenue).toBe(50000);
    expect(component.stats?.topEmployees.length).toBe(1);
    expect(component.stats?.topProducts.length).toBe(1);
  });
});
