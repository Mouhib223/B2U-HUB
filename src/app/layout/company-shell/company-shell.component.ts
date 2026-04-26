import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'b2u-company-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="shell">
      <aside class="sidebar" [class.collapsed]="collapsed">
        <div class="logo">
          <span class="badge">B2U</span>
          <span *ngIf="!collapsed" class="label">COMPANY</span>
        </div>
        <nav>
          <a routerLink="/company/candidatures" routerLinkActive="active">
            <mat-icon>people</mat-icon><span *ngIf="!collapsed">Candidatures</span>
          </a>

          <a routerLink="/company/work-post" routerLinkActive="active">
            <mat-icon>work</mat-icon><span *ngIf="!collapsed">Work Post</span>
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span *ngIf="!collapsed">Déconnexion</span>
          </button>
        </div>
      </aside>
      <div class="main" [class.expanded]="collapsed">
        <header>
          <button (click)="collapsed=!collapsed"><mat-icon>menu</mat-icon></button>
          <span>Espace Entreprise</span>
        </header>
        <main><router-outlet></router-outlet></main>
      </div>
    </div>
  `,
  styles: [`
    .shell { display:flex; height:100vh; }
    .sidebar { width:220px; background:#064E3B; color:#fff; display:flex; flex-direction:column; padding:1rem 0; transition:width .2s; }
    .sidebar.collapsed { width:60px; }
    .logo { display:flex; align-items:center; gap:.5rem; padding:.5rem 1rem 1.5rem; }
    .badge { background:#059669; border-radius:6px; padding:2px 8px; font-weight:700; font-size:.85rem; }
    .label { font-weight:700; font-size:.9rem; }
    nav { display:flex; flex-direction:column; gap:4px; padding:0 .5rem; flex:1; }
    nav a { display:flex; align-items:center; gap:.6rem; padding:.6rem .75rem; border-radius:8px; color:#6EE7B7; text-decoration:none; font-size:.875rem; transition:background .15s; }
    nav a:hover, nav a.active { background:#065F46; color:#fff; }
    .sidebar-footer { padding:.75rem .5rem; border-top:1px solid rgba(255,255,255,.1); }
    .logout-btn { display:flex; align-items:center; gap:.6rem; width:100%; padding:.6rem .75rem; border-radius:8px; background:transparent; border:none; color:#6EE7B7; font-size:.875rem; cursor:pointer; transition:background .15s; }
    .logout-btn:hover { background:#065F46; color:#fff; }
    .main { flex:1; display:flex; flex-direction:column; background:#F9FAFB; overflow:hidden; }
    header { display:flex; align-items:center; gap:1rem; padding:.75rem 1.5rem; background:#fff; border-bottom:1px solid #E2E8F0; font-weight:600; color:#1E293B; }
    header button { border:none; background:transparent; cursor:pointer; display:flex; align-items:center; color:#64748B; }
    main { flex:1; overflow-y:auto; padding:1.5rem; }
  `]
})
export class CompanyShellComponent {
  private auth = inject(AuthService);
  collapsed = false;
  logout() { this.auth.logout(); }
}
