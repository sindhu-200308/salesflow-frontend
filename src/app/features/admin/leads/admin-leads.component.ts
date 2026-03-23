import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Lead, User } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-leads.component.html',
  styleUrls: ['./admin-leads.component.css']
})
export class AdminLeadsComponent implements OnInit {
  leads: Lead[] = [];
  filteredLeads: Lead[] = [];
  managers: User[] = [];
  searchTerm = '';
  showFormModal = false;
  showAssignModal = false;
  editingLead: Lead | null = null;
  assigningLead: Lead | null = null;
  selectedManagerId: number | null = null;
  saving = false;
  formError = '';
  leadForm: FormGroup;

  sources = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Event', 'Other'];
  statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'REJECTED'];

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      source: [''],
      notes: [''],
      status: ['NEW']
    });
  }

  ngOnInit(): void {
    this.loadLeads();
    this.api.getManagers().subscribe(m => this.managers = m);
  }

  loadLeads(): void {
    this.api.adminGetAllLeads().subscribe(leads => {
      this.leads = leads;
      this.filterLeads();
    });
  }

  filterLeads(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredLeads = this.leads.filter(l =>
      l.name.toLowerCase().includes(term) ||
      l.email.toLowerCase().includes(term) ||
      (l.company || '').toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.editingLead = null;
    this.leadForm.reset({ status: 'NEW' });
    this.formError = '';
    this.showFormModal = true;
  }

  openEditModal(lead: Lead): void {
    this.editingLead = lead;
    this.leadForm.patchValue(lead);
    this.formError = '';
    this.showFormModal = true;
  }

  openAssignModal(lead: Lead): void {
    this.assigningLead = lead;
    this.selectedManagerId = lead.assignedManager?.id ?? null;
    this.showAssignModal = true;
  }

  saveLead(): void {
    if (this.leadForm.invalid) return;
    this.saving = true;
    const data = this.leadForm.value;
    const obs = this.editingLead
      ? this.api.adminUpdateLead(this.editingLead.id, data)
      : this.api.adminCreateLead(data);

    obs.subscribe({
      next: () => { this.closeModals(); this.loadLeads(); },
      error: (err) => { this.formError = err.error || 'Error saving lead'; this.saving = false; }
    });
  }

  assignToManager(): void {
    if (!this.assigningLead || !this.selectedManagerId) return;
    this.saving = true;
    this.api.assignLeadToManager(this.assigningLead.id, this.selectedManagerId).subscribe({
      next: () => { this.closeModals(); this.loadLeads(); },
      error: () => { this.saving = false; }
    });
  }

  deleteLead(id: number): void {
    if (!confirm('Delete this lead?')) return;
    this.api.adminDeleteLead(id).subscribe(() => this.loadLeads());
  }

  closeModals(): void {
    this.showFormModal = false;
    this.showAssignModal = false;
    this.saving = false;
    this.editingLead = null;
    this.assigningLead = null;
  }
}
