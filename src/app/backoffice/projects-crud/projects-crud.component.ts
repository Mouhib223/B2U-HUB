import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-projects-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page">
      <h1>Project Management</h1>
      <p style="color:#64748B; margin-top:0.25rem">
        {{ projects.length }} total projects on the platform
      </p>

      <div class="search-bar" style="margin-top:1.5rem">
        <mat-icon>search</mat-icon>
        <input [(ngModel)]="search" placeholder="Search projects...">
      </div>

      <div class="table-card" style="margin-top:1.5rem">
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Company</th><th>Status</th>
              <th>Applicants</th><th>Deadline</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered">
              <td><strong>{{ p.title }}</strong></td>
              <td>{{ p.company }}</td>
              <td><span class="badge" [ngClass]="p.status">{{ p.status }}</span></td>
              <td>{{ p.applicants }}</td>
              <td>{{ p.deadline }}</td>
              <td>
                <button class="action-btn delete" (click)="delete(p.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 0; }
    h1 { font-size: 1.6rem; color: #1E293B; }
    .search-bar { display:flex; align-items:center; gap:.5rem; background:white; border:1px solid #E2E8F0; border-radius:8px; padding:.5rem 1rem; }
    .search-bar input { border:none; outline:none; font-size:.875rem; background:transparent; font-family:'Plus Jakarta Sans',sans-serif; width:100%; }
    mat-icon { color:#94A3B8; font-size:18px; width:18px; height:18px; }
    .table-card { background:white; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden; }
    table { width:100%; border-collapse:collapse; }
    thead tr { background:#F8FAFC; border-bottom:1px solid #E2E8F0; }
    th { padding:.75rem 1rem; font-size:.72rem; font-weight:700; color:#64748B; text-transform:uppercase; letter-spacing:.05em; text-align:left; }
    td { padding:.875rem 1rem; font-size:.875rem; color:#334155; border-bottom:1px solid #F1F5F9; }
    .badge { padding:3px 10px; border-radius:999px; font-size:.72rem; font-weight:600; }
    .open { background:#D1FAE5; color:#065F46; }
    .closed { background:#FEE2E2; color:#991B1B; }
    .in-progress { background:#DBEAFE; color:#1E40AF; }
    .action-btn { background:none; border:none; cursor:pointer; padding:5px; border-radius:6px; }
    .delete { color:#EF4444; }
    .delete:hover { background:#FEF2F2; }
  `]
})
export class ProjectsCrudComponent {
  search = '';

  projects = [
    { id:'1', title:'React Dashboard',      company:'FinTech Corp',  status:'open',        applicants:8,  deadline:'2025-08-01' },
    { id:'2', title:'AI Chatbot',           company:'ShopAI',        status:'in-progress', applicants:12, deadline:'2025-07-15' },
    { id:'3', title:'Mobile Campus App',    company:'UniTech',       status:'open',        applicants:5,  deadline:'2025-09-01' },
    { id:'4', title:'E-Commerce Redesign',  company:'RetailTN',      status:'closed',      applicants:20, deadline:'2025-06-01' },
  ];

  get filtered() {
    return this.projects.filter(p =>
      p.title.toLowerCase().includes(this.search.toLowerCase()) ||
      p.company.toLowerCase().includes(this.search.toLowerCase())
    );
  }

  delete(id: string) {
    this.projects = this.projects.filter(p => p.id !== id);
  }
}