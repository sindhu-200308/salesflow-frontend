import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Customer } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css']
})
export class AdminCustomersComponent implements OnInit {
  customers: Customer[] = [];
  filtered: Customer[] = [];
  showModal = false;
  editing: Customer | null = null;
  saving = false;
  searchTerm = '';
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      company: [''],
      address: ['']
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.adminGetAllCustomers().subscribe(c => { this.customers = c; this.filter(); });
  }

  filter(): void {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.customers.filter(c =>
      c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t)
    );
  }

  openCreateModal(): void { this.editing = null; this.form.reset(); this.showModal = true; }
  openEditModal(c: Customer): void { this.editing = c; this.form.patchValue(c); this.showModal = true; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.editing
      ? this.api.adminUpdateCustomer(this.editing.id, this.form.value)
      : this.api.adminCreateCustomer(this.form.value);
    obs.subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: () => { this.saving = false; }
    });
  }

  deleteCustomer(id: number): void {
    if (!confirm('Delete this customer?')) return;
    this.api.adminDeleteCustomer(id).subscribe(() => this.load());
  }

  closeModal(): void { this.showModal = false; this.saving = false; this.editing = null; }
}
