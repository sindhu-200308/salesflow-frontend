import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import {
  Sale, Customer, Product,
  EmployeeSalesSummary, SaleItemRequest
} from '../../../shared/models/models';

interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-employee-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-sales.component.html',
  styleUrls: ['./employee-sales.component.css']
})
export class EmployeeSalesComponent implements OnInit {
  // Lists
  sales: Sale[] = [];
  filtered: Sale[] = [];
  customers: Customer[] = [];
  products: Product[] = [];

  // Summary
  summary: EmployeeSalesSummary | null = null;

  // Search
  searchTerm = '';

  // Modal flags
  showCreateModal = false;
  showDetailModal = false;
  selectedSale: Sale | null = null;

  // Create sale form
  selectedCustomerId: number | null = null;
  saleNotes = '';
  cartItems: CartItem[] = [];
  grandTotal = 0;
  pickProductId: number | null = null;
  pickQty = 1;
  saving = false;
  createError = '';
  createSuccess = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadSummary();
    this.api.adminGetAllCustomers().subscribe(c => this.customers = c);
    this.api.adminGetAllProducts().subscribe(p => this.products = p.filter(x => x.active));
  }

  loadSales(): void {
    this.api.getMySales().subscribe(s => { this.sales = s; this.filter(); });
  }

  loadSummary(): void {
    this.api.getMySalesSummary().subscribe(s => this.summary = s);
  }

  filter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.sales.filter(s =>
      s.customerName.toLowerCase().includes(t) ||
      (s.customerCompany || '').toLowerCase().includes(t)
    );
  }

  onCustomerChange(): void { /* selection tracked via ngModel */ }

  // ── Cart Management ─────────────────────────────────────

  addItem(): void {
    if (!this.pickProductId || !this.pickQty || this.pickQty < 1) return;

    const product = this.products.find(p => p.id === this.pickProductId);
    if (!product) return;

    // If already in cart, increase qty
    const existing = this.cartItems.find(c => c.productId === this.pickProductId);
    if (existing) {
      existing.quantity += this.pickQty;
      existing.subtotal = existing.unitPrice * existing.quantity;
    } else {
      this.cartItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: this.pickQty,
        subtotal: product.price * this.pickQty
      });
    }

    this.pickProductId = null;
    this.pickQty = 1;
    this.recalcTotal();
  }

  recalcItem(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity < 1) item.quantity = 1;
    item.subtotal = item.unitPrice * item.quantity;
    this.recalcTotal();
  }

  removeItem(index: number): void {
    this.cartItems.splice(index, 1);
    this.recalcTotal();
  }

  recalcTotal(): void {
    this.grandTotal = this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // ── Submit Sale ─────────────────────────────────────────

  submitSale(): void {
    if (!this.selectedCustomerId || this.cartItems.length === 0) return;
    this.saving = true;
    this.createError = '';
    this.createSuccess = '';

    const items: SaleItemRequest[] = this.cartItems.map(c => ({
      productId: c.productId,
      quantity: c.quantity
    }));

    this.api.createSale({
      customerId: this.selectedCustomerId,
      items,
      notes: this.saleNotes
    }).subscribe({
      next: (sale) => {
        this.createSuccess = `Sale #${sale.id} created! Total: ₹${sale.totalAmount}`;
        this.cartItems = [];
        this.grandTotal = 0;
        this.selectedCustomerId = null;
        this.saleNotes = '';
        this.saving = false;
        this.loadSales();
        this.loadSummary();
      },
      error: (err) => {
        this.createError = err.error || 'Failed to create sale. Please try again.';
        this.saving = false;
      }
    });
  }

  // ── Modals ───────────────────────────────────────────────

  openCreate(): void {
    this.cartItems = [];
    this.grandTotal = 0;
    this.selectedCustomerId = null;
    this.saleNotes = '';
    this.pickProductId = null;
    this.pickQty = 1;
    this.createError = '';
    this.createSuccess = '';
    this.showCreateModal = true;
  }

  viewSale(sale: Sale): void {
    this.selectedSale = sale;
    this.showDetailModal = true;
  }

  closeAll(): void {
    this.showCreateModal = false;
    this.showDetailModal = false;
    this.selectedSale = null;
    this.saving = false;
  }
}
