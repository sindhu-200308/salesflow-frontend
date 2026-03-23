// ========== ENUMS ==========
export type RoleType = 'ROLE_ADMIN' | 'ROLE_SALES_MANAGER' | 'ROLE_SALES_EMPLOYEE';
export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED' | 'REJECTED';

// ========== AUTH ==========
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  name: string;
  email: string;
  role: RoleType;
}

// ========== USER ==========
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  active: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: RoleType;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  active?: boolean;
}

// ========== LEAD ==========
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  notes: string;
  status: LeadStatus;
  assignedManager?: User;
  assignedEmployee?: User;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  notes: string;
}

export interface UpdateLeadRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  status?: LeadStatus;
}

// ========== CUSTOMER ==========
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  convertedFromLeadId?: number;
  assignedTo?: User;
  createdAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

// ========== PRODUCT ==========
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
}

// ========== FOLLOW UP ==========
export interface FollowUp {
  id: number;
  leadId: number;
  leadName: string;
  createdBy: User;
  notes: string;
  followUpDate: string;
  outcome: string;
  createdAt: string;
}

export interface CreateFollowUpRequest {
  leadId: number;
  notes: string;
  followUpDate: string;
  outcome: string;
}

// ========== DASHBOARD ==========
export interface AdminStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  totalCustomers: number;
  totalProducts: number;
  totalEmployees: number;
  totalManagers: number;
  totalSales: number;
  totalRevenue: number;
}

export interface ManagerStats {
  assignedLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  totalEmployees: number;
  totalSales: number;
}

export interface EmployeeStats {
  assignedLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  convertedLeads: number;
  rejectedLeads: number;
  totalFollowUps: number;
  totalSales: number;
  myRevenue: number;
}

// ========== SALES ==========
export type SaleStatus = 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'REFUNDED';

export interface SaleItemRequest {
  productId: number;
  quantity: number;
}

export interface CreateSaleRequest {
  customerId: number;
  items: SaleItemRequest[];
  notes?: string;
}

export interface SaleItemResponse {
  id: number;
  productId: number;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  employeeId: number;
  employeeName: string;
  items: SaleItemResponse[];
  totalAmount: number;
  status: SaleStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface TopEmployee {
  employeeId: number;
  employeeName: string;
  totalSales: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
}

export interface SalesStats {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  cancelledSales: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  topEmployees: TopEmployee[];
  topProducts: TopProduct[];
}

export interface EmployeeSalesSummary {
  totalSales: number;
  totalRevenue: number;
  completedSales: number;
  pendingSales: number;
}
