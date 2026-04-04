import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';

@Component({
  selector: 'b2u-company-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, StatsCardComponent],
  template: `
    <div class="dashboard">
      <div class="dashboard-header">
        <h1>Company Dashboard 🏢</h1>
        <p>Manage your missions and student applications.</p>
      </div>
      <div class="stats-grid">
        <b2u-stats-card *ngFor="let s of stats"
          [label]="s.label" [value]="s.value"
          [icon]="s.icon" [change]="s.change"
          [iconBg]="s.iconBg" [iconColor]="s.iconColor">
        </b2u-stats-card>
      </div>
    </div>
  `,
  styles: [`.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-top: 2rem; }`]
})
export class CompanyDashboardComponent {
  stats = [
    { label: 'Active Missions', value: 5,   icon: 'work',    change: 20,  iconBg: '#EBF5FF', iconColor: '#1A56DB' },
    { label: 'Total Applicants', value: 47, icon: 'people',  change: 35,  iconBg: '#F3FAF7', iconColor: '#0E9F6E' },
    { label: 'Teams Formed',     value: 3,  icon: 'groups',  change: 0,   iconBg: '#FDF4FF', iconColor: '#7E3AF2' },
    { label: 'Projects Closed',  value: 12, icon: 'done_all',change: 10,  iconBg: '#FFF8F1', iconColor: '#D97706' },
  ];
}