import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProjetService } from '../../core/services/projet';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'b2u-projects-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Project Management</h1>
          <p>{{ projects.length }} total projects on the platform</p>
        </div>
      </div>

      <div class="search-bar">
        <mat-icon>search</mat-icon>
        <input [(ngModel)]="search" placeholder="Search by title or company...">
      </div>

      <div class="loading" *ngIf="loading">Loading projects...</div>
      <div class="error" *ngIf="error">{{ error }}</div>

      <div class="table-card" *ngIf="!loading">
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Company</th><th>Type</th>
              <th>Status</th><th>Applicants</th><th>Deadline</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered">
              <td><strong>{{ p.title }}</strong></td>
              <td>{{ p.companyName }}</td>
              <td>{{ p.type || 'PROJET' }}</td>
              <td><span class="badge" [ngClass]="p.status">{{ p.status }}</span></td>
              <td>{{ p.applicantsCount }}</td>
              <td>{{ p.deadline | date:'dd/MM/yyyy' }}</td>
              <td>
                <button class="action-btn delete" (click)="delete(p)" title="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
            <tr *ngIf="filtered.length === 0 && !loading">
              <td colspan="7" style="text-align:center; color:#94A3B8; padding:2rem">
                Aucun projet trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 0; }
    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; }
    h1 { font-size: 1.6rem; color: #1E293B; margin:0; }
    p { color:#64748B; margin:.25rem 0 0; font-size:.875rem; }
    .search-bar { display:flex; align-items:center; gap:.5rem; background:white; border:1px solid #E2E8F0; border-radius:8px; padding:.5rem 1rem; margin-bottom:1.5rem; }
    .search-bar input { border:none; outline:none; font-size:.875rem; background:transparent; width:100%; }
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
    .action-btn { background:none; border:none; cursor:pointer; padding:5px; border-radius:6px; display:inline-flex; align-items:center; }
    .delete { color:#EF4444; }
    .delete:hover { background:#FEF2F2; }
    .loading { color:#64748B; padding:2rem; text-align:center; }
    .error { color:#EF4444; padding:1rem; }
  `]
})
export class ProjectsCrudComponent implements OnInit {
  search = '';
  projects: Project[] = [];
  loading = true;
  error = '';

  constructor(private projetService: ProjetService) {}

  ngOnInit() {
    this.projetService.getAllProjets().subscribe({
      next: (data) => { this.projects = data; this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement des projets.'; this.loading = false; }
    });
  }

  get filtered(): Project[] {
    if (!this.search.trim()) return this.projects;
    const q = this.search.toLowerCase();
    return this.projects.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.companyName?.toLowerCase().includes(q)
    );
  }

  delete(project: Project) {
    if (!confirm(`Supprimer le projet "${project.title}" ?`)) return;
    this.projetService.deleteProjet(project.id!).subscribe({
      next: () => { this.projects = this.projects.filter(p => p.id !== project.id); },
      error: () => { this.error = 'Erreur lors de la suppression.'; }
    });
  }
}
