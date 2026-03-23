import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Lead, User, LeadStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-manager-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-leads.component.html',
  styleUrls: ['./manager-leads.component.css']
})
export class ManagerLeadsComponent implements OnInit {
  leads: Lead[] = [];
  filtered: Lead[] = [];
  employees: User[] = [];
  followUps: any[] = [];
  searchTerm = '';
  statusFilter = '';
  statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'REJECTED'];

  showAssignModal = false;
  showStatusModal = false;
  showFollowUpsModal = false;
  selected: Lead | null = null;
  selectedEmployeeId: number | null = null;
  newStatus: LeadStatus = 'NEW';
  saving = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getManagerLeads().subscribe(l => { this.leads = l; this.filter(); });
    this.api.getManagerEmployees().subscribe(e => this.employees = e);
  }

  filter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.leads.filter(l =>
      (l.name.toLowerCase().includes(t) || l.email.toLowerCase().includes(t)) &&
      (this.statusFilter ? l.status === this.statusFilter : true)
    );
  }

  openAssign(lead: Lead): void {
    this.selected = lead;
    this.selectedEmployeeId = lead.assignedEmployee?.id ?? null;
    this.showAssignModal = true;
  }

  openStatus(lead: Lead): void {
    this.selected = lead;
    this.newStatus = lead.status;
    this.showStatusModal = true;
  }

  openFollowUps(lead: Lead): void {
    this.selected = lead;
    this.api.getFollowUpsForLead(lead.id).subscribe(f => {
      this.followUps = f;
      this.showFollowUpsModal = true;
    });
  }

  assignEmployee(): void {
    if (!this.selected || !this.selectedEmployeeId) return;
    this.saving = true;
    this.api.assignLeadToEmployee(this.selected.id, this.selectedEmployeeId).subscribe({
      next: (updated) => {
        const idx = this.leads.findIndex(l => l.id === updated.id);
        if (idx !== -1) this.leads[idx] = updated;
        this.filter();
        this.closeAll();
      },
      error: () => { this.saving = false; }
    });
  }

  updateStatus(): void {
    if (!this.selected) return;
    this.saving = true;
    this.api.managerUpdateLeadStatus(this.selected.id, this.newStatus).subscribe({
      next: (updated) => {
        const idx = this.leads.findIndex(l => l.id === updated.id);
        if (idx !== -1) this.leads[idx] = updated;
        this.filter();
        this.closeAll();
      },
      error: () => { this.saving = false; }
    });
  }

  closeAll(): void {
    this.showAssignModal = false;
    this.showStatusModal = false;
    this.showFollowUpsModal = false;
    this.saving = false;
    this.selected = null;
  }
}
