import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-applications-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="page">
      <h1>Applications Overview</h1>
      <p style="color:#64748B; margin-top:.25rem">All student applications across all projects</p>

      <div class="table-card" style="margin-top:1.5rem">
        <table>
          <thead>
            <tr>
              <th>Student</th><th>Project</th><th>Company</th>
              <th>Applied On</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of applications">
              <td>{{ a.student }}</td>
              <td>{{ a.project }}</td>
              <td>{{ a.company }}</td>
              <td>{{ a.date }}</td>
              <td><span class="badge" [ngClass]="a.status">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 0; }
    h1 { font-size: 1.6rem; color: #1E293B; }
    .table-card { background:white; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#F8FAFC; border-bottom:1px solid #E2E8F0; }
    th { padding:.75rem 1rem; font-size:.72rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.05em; text-align:left; }
    td { padding:.875rem 1rem; font-size:.875rem; color:#334155; border-bottom:1px solid #F1F5F9; }
    .badge { padding:3px 10px; border-radius:999px; font-size:.72rem; font-weight:600; }
    .pending  { background:#FEF3C7; color:#92400E; }
    .accepted { background:#D1FAE5; color:#065F46; }
    .rejected { background:#FEE2E2; color:#991B1B; }
  `]
})
export class ApplicationsOverviewComponent {
  applications = [
    { student:'Ali Ben Salah',  project:'React Dashboard',   company:'FinTech Corp', date:'2025-03-18', status:'pending'  },
    { student:'Sarra Mansour',  project:'AI Chatbot',        company:'ShopAI',       date:'2025-03-17', status:'accepted' },
    { student:'Youssef Triki',  project:'Mobile Campus App', company:'UniTech',      date:'2025-03-16', status:'rejected' },
    { student:'Mariem Boukef',  project:'React Dashboard',   company:'FinTech Corp', date:'2025-03-15', status:'pending'  },
  ];
}