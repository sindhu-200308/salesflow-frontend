import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Sale, SalesStats, SaleStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-sales.component.html',
  styleUrls: ['./admin-sales.component.css']
})
export class AdminSalesComponent implements OnInit {
  sales: Sale[] = [];
  filtered: Sale[] = [];
  stats: SalesStats | null = null;
  searchTerm = '';
  statusFilter = '';
  statuses: SaleStatus[] = ['COMPLETED', 'PENDING', 'CANCELLED', 'REFUNDED'];

  showDetailModal = false;
  selectedSale: Sale | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadStats();
  }

  loadSales(): void {
    this.api.getAllSales().subscribe(s => { this.sales = s; this.filter(); });
  }

  loadStats(): void {
    this.api.getSalesStats().subscribe(s => this.stats = s);
  }

  filter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.sales.filter(s =>
      (s.customerName.toLowerCase().includes(t) ||
       s.employeeName.toLowerCase().includes(t)) &&
      (this.statusFilter ? s.status === this.statusFilter : true)
    );
  }

  viewSale(sale: Sale): void {
    this.selectedSale = sale;
    this.showDetailModal = true;
  }

  changeStatus(id: number, status: SaleStatus): void {
    this.api.updateSaleStatus(id, status).subscribe(updated => {
      const idx = this.sales.findIndex(s => s.id === id);
      if (idx !== -1) this.sales[idx] = updated;
      if (this.selectedSale?.id === id) this.selectedSale = updated;
      this.filter();
      this.loadStats();
    });
  }

  deleteSale(id: number): void {
    if (!confirm('Delete this sale record?')) return;
    this.api.deleteSale(id).subscribe(() => { this.loadSales(); this.loadStats(); });
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedSale = null;
  }
}
