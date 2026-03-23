import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AdminStats } from '../../../shared/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminStats | null = null;
  pipeline: { label: string; value: number; color: string }[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminDashboard().subscribe({
      next: (data) => {
        this.stats = data;
        this.pipeline = [
          { label: 'New',        value: data.newLeads,        color: 'var(--blue)' },
          { label: 'Contacted',  value: data.contactedLeads,  color: 'var(--amber)' },
          { label: 'Interested', value: data.interestedLeads, color: 'var(--purple)' },
          { label: 'Converted',  value: data.convertedLeads,  color: 'var(--green)' },
          { label: 'Rejected',   value: data.rejectedLeads,   color: 'var(--red)' },
        ];
      }
    });
  }
}
