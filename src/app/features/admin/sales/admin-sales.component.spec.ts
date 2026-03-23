import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AdminSalesComponent } from './admin-sales.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Sale, SalesStats } from '../../../shared/models/models';

const mockSale: Sale = {
  id: 1, customerId: 1, customerName: 'Acme Corp', customerEmail: 'acme@corp.com',
  customerCompany: 'Acme', employeeId: 3, employeeName: 'John Emp',
  items: [
    { id: 1, productId: 1, productName: 'CRM Pro', productCategory: 'Software',
      quantity: 2, unitPrice: 4999, subtotal: 9998 }
  ],
  totalAmount: 9998, status: 'COMPLETED', notes: '', createdAt: '2024-01-15T10:00:00', updatedAt: '2024-01-15T10:00:00'
};

const mockStats: SalesStats = {
  totalSales: 10, completedSales: 8, pendingSales: 1, cancelledSales: 1,
  totalRevenue: 99980, monthlyRevenue: 49990, weeklyRevenue: 19996,
  topEmployees: [{ employeeId: 3, employeeName: 'John Emp', totalSales: 49990 }],
  topProducts:  [{ productId: 1, productName: 'CRM Pro', totalQuantity: 10 }]
};

describe('AdminSalesComponent', () => {
  let component: AdminSalesComponent;
  let fixture: ComponentFixture<AdminSalesComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getAllSales', 'getSalesStats', 'updateSaleStatus', 'deleteSale'
    ]);
    spy.getAllSales.and.returnValue(of([mockSale]));
    spy.getSalesStats.and.returnValue(of(mockStats));
    spy.updateSaleStatus.and.returnValue(of({ ...mockSale, status: 'PENDING' as any }));
    spy.deleteSale.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminSalesComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load sales and stats on init', () => {
    expect(apiSpy.getAllSales).toHaveBeenCalled();
    expect(apiSpy.getSalesStats).toHaveBeenCalled();
    expect(component.sales.length).toBe(1);
    expect(component.stats).toEqual(mockStats);
  });

  it('should filter sales by customer name', () => {
    component.searchTerm = 'Acme';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.searchTerm = 'zzz';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should filter sales by status', () => {
    component.statusFilter = 'COMPLETED';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.statusFilter = 'CANCELLED';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should open detail modal when viewSale is called', () => {
    component.viewSale(mockSale);
    expect(component.showDetailModal).toBeTrue();
    expect(component.selectedSale).toEqual(mockSale);
  });

  it('should close modal', () => {
    component.showDetailModal = true;
    component.selectedSale = mockSale;
    component.closeModal();
    expect(component.showDetailModal).toBeFalse();
    expect(component.selectedSale).toBeNull();
  });

  it('should call updateSaleStatus on changeStatus', () => {
    component.viewSale(mockSale);
    component.changeStatus(mockSale.id, 'PENDING');
    expect(apiSpy.updateSaleStatus).toHaveBeenCalledWith(mockSale.id, 'PENDING');
  });

  it('should delete sale with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteSale(1);
    expect(apiSpy.deleteSale).toHaveBeenCalledWith(1);
  });

  it('should NOT delete sale without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteSale(1);
    expect(apiSpy.deleteSale).not.toHaveBeenCalled();
  });

  it('should have correct status list', () => {
    expect(component.statuses).toEqual(['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED']);
  });
});
