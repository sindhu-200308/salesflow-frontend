import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { EmployeeSalesComponent } from './employee-sales.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Sale, Customer, Product, EmployeeSalesSummary } from '../../../shared/models/models';

const mockCustomers: Customer[] = [
  { id: 1, name: 'Acme Corp', email: 'acme@corp.com', phone: '9999', company: 'Acme', address: '', createdAt: '' }
];

const mockProducts: Product[] = [
  { id: 1, name: 'CRM Pro', description: '', price: 4999, category: 'Software', stock: 10, active: true, createdAt: '' }
];

const mockSales: Sale[] = [
  {
    id: 1, customerId: 1, customerName: 'Acme Corp', customerEmail: 'acme@corp.com',
    customerCompany: 'Acme', employeeId: 3, employeeName: 'Me',
    items: [{ id: 1, productId: 1, productName: 'CRM Pro', productCategory: 'Software', quantity: 1, unitPrice: 4999, subtotal: 4999 }],
    totalAmount: 4999, status: 'COMPLETED', notes: '', createdAt: '2024-01-10T10:00:00', updatedAt: '2024-01-10T10:00:00'
  }
];

const mockSummary: EmployeeSalesSummary = {
  totalSales: 1, totalRevenue: 4999, completedSales: 1, pendingSales: 0
};

describe('EmployeeSalesComponent', () => {
  let component: EmployeeSalesComponent;
  let fixture: ComponentFixture<EmployeeSalesComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'getMySales', 'getMySalesSummary', 'adminGetAllCustomers',
      'adminGetAllProducts', 'createSale'
    ]);
    spy.getMySales.and.returnValue(of(mockSales));
    spy.getMySalesSummary.and.returnValue(of(mockSummary));
    spy.adminGetAllCustomers.and.returnValue(of(mockCustomers));
    spy.adminGetAllProducts.and.returnValue(of(mockProducts));
    spy.createSale.and.returnValue(of(mockSales[0]));

    await TestBed.configureTestingModule({
      imports: [EmployeeSalesComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(EmployeeSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load data on init', () => {
    expect(component.sales.length).toBe(1);
    expect(component.summary).toEqual(mockSummary);
    expect(component.customers.length).toBe(1);
    expect(component.products.length).toBe(1);
  });

  it('should filter sales by customer name', () => {
    component.searchTerm = 'Acme';
    component.filter();
    expect(component.filtered.length).toBe(1);

    component.searchTerm = 'zzz';
    component.filter();
    expect(component.filtered.length).toBe(0);
  });

  it('should open create modal and reset state', () => {
    component.cartItems = [{ productId: 1, productName: 'X', unitPrice: 100, quantity: 1, subtotal: 100 }];
    component.openCreate();
    expect(component.showCreateModal).toBeTrue();
    expect(component.cartItems.length).toBe(0);
    expect(component.grandTotal).toBe(0);
    expect(component.selectedCustomerId).toBeNull();
  });

  it('should add item to cart', () => {
    component.products = mockProducts;
    component.pickProductId = 1;
    component.pickQty = 2;
    component.addItem();
    expect(component.cartItems.length).toBe(1);
    expect(component.cartItems[0].quantity).toBe(2);
    expect(component.cartItems[0].subtotal).toBe(9998);
    expect(component.grandTotal).toBe(9998);
  });

  it('should increase quantity when same product added again', () => {
    component.products = mockProducts;
    component.pickProductId = 1;
    component.pickQty = 1;
    component.addItem();
    component.pickProductId = 1;
    component.pickQty = 2;
    component.addItem();
    expect(component.cartItems.length).toBe(1);
    expect(component.cartItems[0].quantity).toBe(3);
  });

  it('should remove item from cart', () => {
    component.cartItems = [{ productId: 1, productName: 'X', unitPrice: 100, quantity: 1, subtotal: 100 }];
    component.removeItem(0);
    expect(component.cartItems.length).toBe(0);
    expect(component.grandTotal).toBe(0);
  });

  it('should recalculate item subtotal when qty changes', () => {
    component.cartItems = [{ productId: 1, productName: 'X', unitPrice: 500, quantity: 2, subtotal: 1000 }];
    component.cartItems[0].quantity = 3;
    component.recalcItem(0);
    expect(component.cartItems[0].subtotal).toBe(1500);
    expect(component.grandTotal).toBe(1500);
  });

  it('should not submit if no customer or no cart items', () => {
    component.selectedCustomerId = null;
    component.cartItems = [];
    component.submitSale();
    expect(apiSpy.createSale).not.toHaveBeenCalled();
  });

  it('should submit sale when customer and items are set', () => {
    component.selectedCustomerId = 1;
    component.cartItems = [{ productId: 1, productName: 'CRM Pro', unitPrice: 4999, quantity: 1, subtotal: 4999 }];
    component.saleNotes = 'Test note';
    component.submitSale();
    expect(apiSpy.createSale).toHaveBeenCalledWith({
      customerId: 1,
      items: [{ productId: 1, quantity: 1 }],
      notes: 'Test note'
    });
  });

  it('should open sale detail modal', () => {
    component.viewSale(mockSales[0]);
    expect(component.showDetailModal).toBeTrue();
    expect(component.selectedSale).toEqual(mockSales[0]);
  });

  it('should close all modals and reset', () => {
    component.showCreateModal = true;
    component.showDetailModal = true;
    component.selectedSale = mockSales[0];
    component.closeAll();
    expect(component.showCreateModal).toBeFalse();
    expect(component.showDetailModal).toBeFalse();
    expect(component.selectedSale).toBeNull();
  });
});
