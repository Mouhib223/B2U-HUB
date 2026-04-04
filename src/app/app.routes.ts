import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  // Public
  {
    path: 'landing',
    loadComponent: () => import('./features/landing/landing-page/landing-page')
      .then(m => m.LandingPageComponent)
  },

  // Auth (public)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },

  // ─────────────────────────────────────────
  // FRONT OFFICE — Students & Companies
  // ─────────────────────────────────────────
  {
    path: 'app',
    loadComponent: () => import('./layout/shell/shell.component')
      .then(m => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.DASHBOARD_ROUTES)
      },
      {
        path: 'projects',
        loadChildren: () => import('./features/projects/projects.routes')
          .then(m => m.PROJECTS_ROUTES)
      },
      {
        path: 'scoring',
        loadComponent: () => import('./features/ai-scoring/scoring-dashboard/scoring-dashboard')
          .then(m => m.ScoringDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/users/my-profile/my-profile')
          .then(m => m.MyProfile)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ─────────────────────────────────────────
  // BACK OFFICE — Admin only
  // ─────────────────────────────────────────
  {
    path: 'admin',
    loadComponent: () => import('./layout/admin-shell/admin-shell.component')
      .then(m => m.AdminShellComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./backoffice/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./backoffice/users-crud/users-crud.component')
          .then(m => m.UsersCrudComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./backoffice/projects-crud/projects-crud.component')
          .then(m => m.ProjectsCrudComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./backoffice/applications-overview/applications-overview.component')
          .then(m => m.ApplicationsOverviewComponent)
      },
      {
        path: 'companies',
        loadComponent: () => import('./backoffice/companies-crud/companies-crud')
          .then(m => m.CompaniesCrudComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/landing' }
];