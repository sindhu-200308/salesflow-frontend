import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-employee-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive],
  templateUrl: './employee-layout.component.html',
  styleUrls: ['./employee-layout.component.css']
})
export class EmployeeLayoutComponent {
  user = this.authService.getCurrentUser();

  constructor(private authService: AuthService) {}

  getInitials(): string {
    return this.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'SE';
  }

  logout(): void { this.authService.logout(); }
}
