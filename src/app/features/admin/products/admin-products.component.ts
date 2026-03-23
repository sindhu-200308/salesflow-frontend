import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  showModal = false;
  editing: Product | null = null;
  saving = false;
  form: FormGroup;

  constructor(private api: ApiService, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      category: [''],
      stock: [0]
    });
  }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.adminGetAllProducts().subscribe(p => this.products = p);
  }

  openCreate(): void { this.editing = null; this.form.reset({ stock: 0 }); this.showModal = true; }
  openEdit(p: Product): void { this.editing = p; this.form.patchValue(p); this.showModal = true; }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const obs = this.editing
      ? this.api.adminUpdateProduct(this.editing.id, this.form.value)
      : this.api.adminCreateProduct(this.form.value);
    obs.subscribe({
      next: () => { this.close(); this.load(); },
      error: () => { this.saving = false; }
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this product?')) return;
    this.api.adminDeleteProduct(id).subscribe(() => this.load());
  }

  close(): void { this.showModal = false; this.saving = false; this.editing = null; }
}
