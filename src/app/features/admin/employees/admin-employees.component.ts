import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { User, RoleType } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-employees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-employees.component.html',
  styleUrls: ['./admin-employees.component.css']
})
export class AdminEmployeesComponent implements OnInit {
  employees: User[] = [];
  showModal = false;
  editingUser: User | null = null;
  saving = false;
  formError = '';
  userForm: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      phone: ['', Validators.required],
      role: ['ROLE_SALES_EMPLOYEE']
    });
  }

  ngOnInit(): void { this.loadEmployees(); }

  loadEmployees(): void {
    this.api.getAllEmployees().subscribe(e => this.employees = e);
  }

  getRoleBadge(role: RoleType): string {
    const map: Record<RoleType, string> = {
      'ROLE_ADMIN': 'badge-admin',
      'ROLE_SALES_MANAGER': 'badge-manager',
      'ROLE_SALES_EMPLOYEE': 'badge-employee'
    };
    return map[role] || 'badge-employee';
  }

  getRoleLabel(role: RoleType): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }

  openCreateModal(): void {
    this.editingUser = null;
    this.userForm.reset({ role: 'ROLE_SALES_EMPLOYEE' });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.formError = '';
    this.showModal = true;
  }

  openEditModal(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue(user);
    this.userForm.get('password')?.clearValidators();
    this.formError = '';
    this.showModal = true;
  }

  saveUser(): void {
    if (this.userForm.invalid) return;
    this.saving = true;
    const obs = this.editingUser
      ? this.api.updateEmployee(this.editingUser.id, this.userForm.value)
      : this.api.createEmployee(this.userForm.value);
    obs.subscribe({
      next: () => { this.closeModal(); this.loadEmployees(); },
      error: (err) => { this.formError = err.error || 'Error'; this.saving = false; }
    });
  }

  deactivate(id: number): void {
    if (!confirm('Deactivate this employee?')) return;
    this.api.deleteEmployee(id).subscribe(() => this.loadEmployees());
  }

  closeModal(): void { this.showModal = false; this.saving = false; this.editingUser = null; }
}
