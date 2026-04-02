import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  stats = [
    { label: 'Total Users',       value: 248,  icon: 'people',      color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Active Projects',   value: 63,   icon: 'work',        color: '#10B981', bg: '#ECFDF5' },
    { label: 'Applications',      value: 512,  icon: 'assignment',  color: '#8B5CF6', bg: '#F5F3FF' },
    { label: 'Companies',         value: 34,   icon: 'business',    color: '#F59E0B', bg: '#FFFBEB' },
  ];

  recentUsers = [
    { name: 'Ali Ben Salah',   email: 'ali@etu.tn',       role: 'student', date: '2025-03-20' },
    { name: 'TechCorp Tunisia', email: 'hr@techcorp.tn',  role: 'company', date: '2025-03-19' },
    { name: 'Sarra Mansour',   email: 'sarra@etu.tn',     role: 'student', date: '2025-03-18' },
    { name: 'StartupHub',      email: 'info@startup.tn',  role: 'company', date: '2025-03-17' },
  ];
}