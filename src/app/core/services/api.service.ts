import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User, CreateUserRequest, UpdateUserRequest,
  Lead, CreateLeadRequest, UpdateLeadRequest, LeadStatus,
  Customer, CreateCustomerRequest,
  Product, CreateProductRequest,
  FollowUp, CreateFollowUpRequest,
  AdminStats, ManagerStats, EmployeeStats,
  Sale, CreateSaleRequest, SaleStatus, SalesStats, EmployeeSalesSummary
} from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ---- ADMIN: Employees ----
  createEmployee(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(`${this.api}/admin/employees`, data);
  }
  getAllEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/admin/employees`);
  }
  getManagers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/admin/employees/managers`);
  }
  getSalesEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/admin/employees/sales`);
  }
  updateEmployee(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.api}/admin/employees/${id}`, data);
  }
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/employees/${id}`);
  }

  // ---- ADMIN: Leads ----
  adminCreateLead(data: CreateLeadRequest): Observable<Lead> {
    return this.http.post<Lead>(`${this.api}/admin/leads`, data);
  }
  adminGetAllLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.api}/admin/leads`);
  }
  adminGetLead(id: number): Observable<Lead> {
    return this.http.get<Lead>(`${this.api}/admin/leads/${id}`);
  }
  adminUpdateLead(id: number, data: UpdateLeadRequest): Observable<Lead> {
    return this.http.put<Lead>(`${this.api}/admin/leads/${id}`, data);
  }
  adminDeleteLead(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/leads/${id}`);
  }
  assignLeadToManager(leadId: number, managerId: number): Observable<Lead> {
    return this.http.post<Lead>(`${this.api}/admin/leads/${leadId}/assign-manager/${managerId}`, {});
  }

  // ---- ADMIN: Customers ----
  adminGetAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.api}/admin/customers`);
  }
  adminCreateCustomer(data: CreateCustomerRequest): Observable<Customer> {
    return this.http.post<Customer>(`${this.api}/admin/customers`, data);
  }
  adminUpdateCustomer(id: number, data: any): Observable<Customer> {
    return this.http.put<Customer>(`${this.api}/admin/customers/${id}`, data);
  }
  adminDeleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/customers/${id}`);
  }

  // ---- ADMIN: Products ----
  adminGetAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.api}/admin/products`);
  }
  adminCreateProduct(data: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.api}/admin/products`, data);
  }
  adminUpdateProduct(id: number, data: any): Observable<Product> {
    return this.http.put<Product>(`${this.api}/admin/products/${id}`, data);
  }
  adminDeleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admin/products/${id}`);
  }

  // ---- ADMIN: Dashboard ----
  getAdminDashboard(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/admin/dashboard`);
  }

  // ---- MANAGER ----
  getManagerDashboard(): Observable<ManagerStats> {
    return this.http.get<ManagerStats>(`${this.api}/manager/dashboard`);
  }
  getManagerLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.api}/manager/leads`);
  }
  assignLeadToEmployee(leadId: number, employeeId: number): Observable<Lead> {
    return this.http.post<Lead>(`${this.api}/manager/leads/${leadId}/assign-employee/${employeeId}`, {});
  }
  managerUpdateLeadStatus(leadId: number, status: LeadStatus): Observable<Lead> {
    return this.http.put<Lead>(`${this.api}/manager/leads/${leadId}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }
  getManagerEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/manager/employees`);
  }
  getEmployeeLeads(employeeId: number): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.api}/manager/employees/${employeeId}/leads`);
  }

  // ---- EMPLOYEE ----
  getEmployeeDashboard(): Observable<EmployeeStats> {
    return this.http.get<EmployeeStats>(`${this.api}/employee/dashboard`);
  }
  getMyLeads(): Observable<Lead[]> {
    return this.http.get<Lead[]>(`${this.api}/employee/leads`);
  }
  updateMyLeadStatus(leadId: number, status: LeadStatus): Observable<Lead> {
    return this.http.put<Lead>(`${this.api}/employee/leads/${leadId}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }
  convertLeadToCustomer(leadId: number): Observable<Customer> {
    return this.http.post<Customer>(`${this.api}/employee/leads/${leadId}/convert`, {});
  }
  addFollowUp(data: CreateFollowUpRequest): Observable<FollowUp> {
    return this.http.post<FollowUp>(`${this.api}/employee/followups`, data);
  }
  getFollowUpsForLead(leadId: number): Observable<FollowUp[]> {
    return this.http.get<FollowUp[]>(`${this.api}/employee/followups/lead/${leadId}`);
  }
  getMyFollowUps(): Observable<FollowUp[]> {
    return this.http.get<FollowUp[]>(`${this.api}/employee/followups/my`);
  }

  // ---- SALES ----
  createSale(data: CreateSaleRequest): Observable<Sale> {
    return this.http.post<Sale>(`${this.api}/sales`, data);
  }
  getAllSales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.api}/sales`);
  }
  getSaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.api}/sales/${id}`);
  }
  getSalesStats(): Observable<SalesStats> {
    return this.http.get<SalesStats>(`${this.api}/sales/stats`);
  }
  getSalesByEmployee(employeeId: number): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.api}/sales/employee/${employeeId}`);
  }
  getEmployeeSalesSummary(employeeId: number): Observable<EmployeeSalesSummary> {
    return this.http.get<EmployeeSalesSummary>(`${this.api}/sales/employee/${employeeId}/summary`);
  }
  getMySales(): Observable<Sale[]> {
    return this.http.get<Sale[]>(`${this.api}/sales/my`);
  }
  getMySalesSummary(): Observable<EmployeeSalesSummary> {
    return this.http.get<EmployeeSalesSummary>(`${this.api}/sales/my/summary`);
  }
  updateSaleStatus(id: number, status: SaleStatus): Observable<Sale> {
    return this.http.put<Sale>(`${this.api}/sales/${id}/status`, { status });
  }
  deleteSale(id: number): Observable<any> {
    return this.http.delete(`${this.api}/sales/${id}`);
  }
}
