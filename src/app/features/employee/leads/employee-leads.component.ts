import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Lead, FollowUp, LeadStatus } from '../../../shared/models/models';

@Component({
  selector: 'app-employee-leads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './employee-leads.component.html',
  styleUrls: ['./employee-leads.component.css']
})
export class EmployeeLeadsComponent implements OnInit {
  leads: Lead[] = [];
  filtered: Lead[] = [];
  leadFollowUps: FollowUp[] = [];
  searchTerm = '';
  statusFilter = '';
  statuses: LeadStatus[] = ['NEW', 'CONTACTED', 'INTERESTED', 'CONVERTED', 'REJECTED'];

  showStatusModal = false;
  showFollowUpModal = false;
  showViewFollowUpsModal = false;
  showConvertModal = false;
  selectedLead: Lead | null = null;
  newStatus: LeadStatus = 'NEW';
  saving = false;
  formSuccess = false;
  formSuccessMessage = '';
  emailSent = false;
  convertError = '';
  convertSuccess = '';

  followUpForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.followUpForm = this.fb.group({
      notes: ['', Validators.required],
      followUpDate: [''],
      outcome: ['']
    });
  }

  ngOnInit(): void {
    this.api.getMyLeads().subscribe(l => { this.leads = l; this.filter(); });
  }

  filter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.leads.filter(l =>
      (l.name.toLowerCase().includes(t) || l.email.toLowerCase().includes(t)) &&
      (this.statusFilter ? l.status === this.statusFilter : true)
    );
  }

  statusIcon(s: LeadStatus): string {
    const icons: Record<LeadStatus, string> = {
      'NEW': '🆕', 'CONTACTED': '📞', 'INTERESTED': '💡',
      'CONVERTED': '✅', 'REJECTED': '❌'
    };
    return icons[s];
  }

  openStatus(lead: Lead): void {
    this.selectedLead = lead;
    this.newStatus = lead.status;
    this.showStatusModal = true;
  }

  openFollowUp(lead: Lead): void {
    this.selectedLead = lead;
    this.showViewFollowUpsModal = false;
    this.followUpForm.reset();
    this.formSuccess = false;
    this.emailSent = false;
    this.formSuccessMessage = '';
    this.showFollowUpModal = true;
  }

  viewFollowUps(lead: Lead): void {
    this.selectedLead = lead;
    this.api.getFollowUpsForLead(lead.id).subscribe(f => {
      this.leadFollowUps = f;
      this.showViewFollowUpsModal = true;
    });
  }

  convertLead(lead: Lead): void {
    this.selectedLead = lead;
    this.convertError = '';
    this.convertSuccess = '';
    this.showConvertModal = true;
  }

  updateStatus(): void {
    if (!this.selectedLead) return;
    this.saving = true;
    this.api.updateMyLeadStatus(this.selectedLead.id, this.newStatus).subscribe({
      next: (updated) => {
        const idx = this.leads.findIndex(l => l.id === updated.id);
        if (idx !== -1) this.leads[idx] = updated;
        this.filter();
        this.closeAll();
      },
      error: () => { this.saving = false; }
    });
  }

  addFollowUp(): void {
    if (!this.selectedLead || this.followUpForm.invalid) return;
    this.saving = true;
    const payload = { ...this.followUpForm.value, leadId: this.selectedLead.id };

    this.api.addFollowUp(payload).subscribe({
      next: (response: any) => {
        this.formSuccess = true;
        // Use emailSent from backend response — it's set based on whether lead has email
        this.emailSent = response?.emailSent === true;
        this.formSuccessMessage = this.emailSent
          ? '📧 Follow-up saved & email sent to ' + this.selectedLead?.email
          : '✅ Follow-up saved (lead has no email address — notification skipped)';
        this.followUpForm.reset();
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  confirmConvert(): void {
    if (!this.selectedLead) return;
    this.saving = true;
    this.api.convertLeadToCustomer(this.selectedLead.id).subscribe({
      next: () => {
        this.convertSuccess = 'Lead successfully converted to customer!';
        const idx = this.leads.findIndex(l => l.id === this.selectedLead!.id);
        if (idx !== -1) this.leads[idx].status = 'CONVERTED';
        this.filter();
        this.saving = false;
      },
      error: (err) => {
        this.convertError = err.error || 'Failed to convert. Customer may already exist.';
        this.saving = false;
      }
    });
  }

  closeAll(): void {
    this.showStatusModal = false;
    this.showFollowUpModal = false;
    this.showViewFollowUpsModal = false;
    this.showConvertModal = false;
    this.saving = false;
    this.formSuccess = false;
    this.emailSent = false;
    this.formSuccessMessage = '';
    this.convertError = '';
    this.convertSuccess = '';
  }
}
