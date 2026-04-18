import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-student-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed">
        <div class="logo">
          <span class="badge">B2U</span>
          <span *ngIf="!collapsed" class="label">STUDENT</span>
        </div>
        <nav>
          <a routerLink="/student/candidatures"    routerLinkActive="active"><mat-icon>description</mat-icon><span *ngIf="!collapsed">Mes Candidatures</span></a>
          <a routerLink="/student/new-candidature" routerLinkActive="active"><mat-icon>add_circle</mat-icon><span *ngIf="!collapsed">Nouvelle</span></a>

          <a routerLink="/student/my-company" routerLinkActive="active">
          <mat-icon>business</mat-icon>
          <span *ngIf="!collapsed">Mon Entreprise</span>
        </a>
        </nav>

<a routerLink="/student/equipes" routerLinkActive="active">
  <mat-icon>groups</mat-icon>
  <span>Equipes</span>
  <mat-icon>groups</mat-icon>
    <span *ngIf="!collapsed">Equipes</span>
  </a>
          </nav>

      </aside>
      <div class="main" [class.expanded]="collapsed">
        <header>
          <button (click)="collapsed=!collapsed"><mat-icon>menu</mat-icon></button>
          <span>Espace Étudiant / Freelancer</span>
        </header>
        <main><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; height:100vh; }
    .sidebar { width:220px; background:#1E293B; color:#fff; display:flex; flex-direction:column; padding:1rem 0; transition:width .2s; }
    .sidebar.collapsed { width:60px; }
    .logo { display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem 1.5rem; }
    .badge { background:#1A56DB; border-radius:6px; padding:2px 8px; font-weight:700; font-size:.85rem; }
    .label { font-weight:700; font-size:.9rem; }
    nav { display:flex; flex-direction:column; gap:4px; padding:0 .5rem; }
    nav a { display:flex; align-items:center; gap:.6rem; padding:.6rem .75rem; border-radius:8px; color:#94A3B8; text-decoration:none; font-size:.875rem; transition:background .15s; }
    nav a:hover, nav a.active { background:#334155; color:#fff; }
    .main { flex:1; display:flex; flex-direction:column; background:#F9FAFB; overflow:hidden; }
    header { display:flex; align-items:center; gap:1rem; padding:.75rem 1.5rem; background:#fff; border-bottom:1px solid #E2E8F0; font-weight:600; color:#1E293B; }
    header button { border:none; background:transparent; cursor:pointer; display:flex; align-items:center; color:#64748B; }
    main { flex:1; overflow-y:auto; padding:1.5rem; }
    .expanded { margin-left:0; }
  `]
})
export class StudentShellComponent {
  collapsed = false;
}
