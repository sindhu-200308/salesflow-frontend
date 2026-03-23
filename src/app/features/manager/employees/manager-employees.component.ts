import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { User, Lead } from '../../../shared/models/models';

@Component({
  selector: 'app-manager-employees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manager-employees.component.html',
  styleUrls: ['./manager-employees.component.css']
})
export class ManagerEmployeesComponent implements OnInit {
  employees: User[] = [];
  showLeadsModal = false;
  selectedEmployee: User | null = null;
  empLeads: Lead[] = [];
  empStats: { label: string; count: number }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getManagerEmployees().subscribe(e => this.employees = e);
  }

  viewLeads(emp: User): void {
    this.selectedEmployee = emp;
    this.api.getEmployeeLeads(emp.id).subscribe(leads => {
      this.empLeads = leads;
      const count = (s: string) => leads.filter(l => l.status === s).length;
      this.empStats = [
        { label: 'New',        count: count('NEW') },
        { label: 'Contacted',  count: count('CONTACTED') },
        { label: 'Interested', count: count('INTERESTED') },
        { label: 'Converted',  count: count('CONVERTED') },
        { label: 'Rejected',   count: count('REJECTED') },
      ];
      this.showLeadsModal = true;
    });
  }

  closeModal(): void {
    this.showLeadsModal = false;
    this.selectedEmployee = null;
    this.empLeads = [];
  }
}
