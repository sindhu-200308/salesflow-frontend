import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { EmployeeStats } from '../../../shared/models/models';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  stats: EmployeeStats | null = null;
  conversionRate = 0;
  rejectionRate = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getEmployeeDashboard().subscribe(data => {
      this.stats = data;
      if (data.assignedLeads > 0) {
        this.conversionRate = Math.round((data.convertedLeads / data.assignedLeads) * 100);
        this.rejectionRate  = Math.round((data.rejectedLeads  / data.assignedLeads) * 100);
      }
    });
  }
}
