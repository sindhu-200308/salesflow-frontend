import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { Sale, SalesStats, EmployeeSalesSummary } from '../../../shared/models/models';

@Component({
  selector: 'app-manager-sales',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-sales.component.html',
  styleUrls: ['./manager-sales.component.css']
})
export class ManagerSalesComponent implements OnInit {
  stats: SalesStats | null = null;
  empSales: Sale[] = [];
  empSummary: EmployeeSalesSummary | null = null;
  showSalesModal = false;
  selectedEmployeeName = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getSalesStats().subscribe(s => this.stats = s);
  }

  viewEmployeeSales(employeeId: number, name: string): void {
    this.selectedEmployeeName = name;
    this.api.getSalesByEmployee(employeeId).subscribe(sales => {
      this.empSales = sales;
    });
    this.api.getEmployeeSalesSummary(employeeId).subscribe(summary => {
      this.empSummary = summary;
      this.showSalesModal = true;
    });
  }

  closeModal(): void {
    this.showSalesModal = false;
    this.empSales = [];
    this.empSummary = null;
  }
}
