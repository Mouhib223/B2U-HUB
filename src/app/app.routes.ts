import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { EquipeFront } from './features/equipe-front/equipe-front';

export const routes: Routes = [

  // 🔵 DEFAULT
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  // 🟢 LANDING
  {
    path: 'landing',
    loadComponent: () =>
      import('./features/landing/landing-page/landing-page')
        .then(m => m.LandingPageComponent)
  },

  // 🔐 AUTH
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  // 🟦 APP
  {
    path: 'app',
    loadComponent: () =>
      import('./layout/shell/shell.component')
        .then(m => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
            .then(m => m.DASHBOARD_ROUTES)
      }
    ]
  },

  // 🎓 STUDENT (FIX PRINCIPAL ICI)
  {
    path: 'student',
    loadComponent: () =>
      import('./layout/student-shell/student-shell.component')
        .then(m => m.StudentShellComponent),
    canActivate: [AuthGuard],
    children: [

      {
        path: 'candidatures',
        loadComponent: () =>
          import('./backoffice/student-candidatures/student-candidatures.component')
            .then(m => m.StudentCandidaturesComponent)
      },

      {
        path: 'new-candidature',
        loadComponent: () =>
          import('./features/candidatures/candidature-form')
            .then(m => m.CandidatureFormComponent)
      },

      {
        path: 'my-company',
        loadComponent: () =>
          import('./backoffice/student-company/student-company.component')
            .then(m => m.StudentCompanyComponent)
      },

      // 👇 EQUIPES
      {
        path: 'equipes',
        component: EquipeFront
      },

      // 💬 CHAT (IMPORTANT FIX)
      {
        path: 'chat/:roomId',
        loadComponent: () =>
          import('./features/chat/chat.component')
            .then(m => m.ChatComponent)
      },

      { path: '', redirectTo: 'candidatures', pathMatch: 'full' }
    ]
  },

  // 🏢 COMPANY
  {
    path: 'company',
    loadComponent: () =>
      import('./layout/company-shell/company-shell.component')
        .then(m => m.CompanyShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./backoffice/company-candidatures/company-candidatures.component')
            .then(m => m.CompanyCandidaturesComponent)
      },
      { path: '', redirectTo: 'candidatures', pathMatch: 'full' }
    ]
  },

  // 🛠 ADMIN
  {
    path: 'admin',
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component')
        .then(m => m.AdminShellComponent),
    canActivate: [AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./backoffice/admin-dashboard/admin-dashboard.component')
            .then(m => m.AdminDashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./backoffice/users-crud/users-crud.component')
            .then(m => m.UsersCrudComponent)
      },
      {
        path: 'projects',
        loadComponent: () =>
          import('./backoffice/projects-crud/projects-crud.component')
            .then(m => m.ProjectsCrudComponent)
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./backoffice/applications-overview/applications-overview.component')
            .then(m => m.ApplicationsOverviewComponent)
      },
      {
        path: 'companies',
        loadComponent: () =>
          import('./backoffice/companies-crud/companies-crud')
            .then(m => m.CompaniesCrudComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./backoffice/candidatures-crud/candidatures-crud.component')
            .then(m => m.CandidaturesCrudComponent)
      },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ❌ fallback
  { path: '**', redirectTo: '/landing' }
];