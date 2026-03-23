import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminProductsComponent } from './admin-products.component';
import { ApiService } from '../../../core/services/api.service';
import { of } from 'rxjs';
import { Product } from '../../../shared/models/models';

const mockProduct: Product = {
  id: 1, name: 'CRM Pro', description: 'Enterprise CRM tool',
  price: 4999, category: 'Software', stock: 100, active: true, createdAt: ''
};

describe('AdminProductsComponent', () => {
  let component: AdminProductsComponent;
  let fixture: ComponentFixture<AdminProductsComponent>;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', [
      'adminGetAllProducts', 'adminCreateProduct', 'adminUpdateProduct', 'adminDeleteProduct'
    ]);
    spy.adminGetAllProducts.and.returnValue(of([mockProduct]));
    spy.adminCreateProduct.and.returnValue(of(mockProduct));
    spy.adminUpdateProduct.and.returnValue(of(mockProduct));
    spy.adminDeleteProduct.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AdminProductsComponent, HttpClientTestingModule, ReactiveFormsModule],
      providers: [{ provide: ApiService, useValue: spy }]
    }).compileComponents();

    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    fixture = TestBed.createComponent(AdminProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load products on init', () => {
    expect(component.products.length).toBe(1);
    expect(component.products[0].name).toBe('CRM Pro');
  });

  it('should open create form with empty data', () => {
    component.openCreate();
    expect(component.showModal).toBeTrue();
    expect(component.editing).toBeNull();
    expect(component.form.get('name')?.value).toBeFalsy();
  });

  it('should open edit form with product data', () => {
    component.openEdit(mockProduct);
    expect(component.showModal).toBeTrue();
    expect(component.editing).toEqual(mockProduct);
    expect(component.form.get('name')?.value).toBe('CRM Pro');
    expect(component.form.get('price')?.value).toBe(4999);
  });

  it('should validate required fields', () => {
    component.openCreate();
    expect(component.form.invalid).toBeTrue();
    component.form.patchValue({ name: 'Test Product', price: 999 });
    expect(component.form.valid).toBeTrue();
  });

  it('should not allow negative price', () => {
    component.form.patchValue({ name: 'Test', price: -100 });
    expect(component.form.get('price')?.invalid).toBeTrue();
  });

  it('should delete product with confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.delete(1);
    expect(apiSpy.adminDeleteProduct).toHaveBeenCalledWith(1);
  });

  it('should not delete without confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);
    expect(apiSpy.adminDeleteProduct).not.toHaveBeenCalled();
  });

  it('should close modal and reset state', () => {
    component.showModal = true;
    component.editing = mockProduct;
    component.close();
    expect(component.showModal).toBeFalse();
    expect(component.editing).toBeNull();
  });
});
