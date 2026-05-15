import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { EquipeFront } from './features/equipe-front/equipe-front';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },

  {
    path: 'landing',
    loadComponent: () =>
      import('./features/landing/landing-page/landing-page')
        .then(m => m.LandingPageComponent)
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.AUTH_ROUTES)
  },

  {
    path: 'student',
    loadComponent: () =>
      import('./layout/student-shell/student-shell.component')
        .then(m => m.StudentShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/student/student-dashboard.component')
            .then(m => m.StudentDashboardComponent)
      },
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
      {
        path: 'my-workpost/:companyId',
        loadComponent: () =>
          import('./backoffice/student-workpost/student-workpost')
            .then(m => m.StudentWorkpost)
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes')
            .then(m => m.PROJECTS_ROUTES)
      },
      {
        path: 'equipes',
        component: EquipeFront
      },
      {
        path: 'chat/:roomId',
        loadComponent: () =>
          import('./features/chat/chat.component')
            .then(m => m.ChatComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/users/my-profile/my-profile')
            .then(m => m.MyProfile)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'company',
    loadComponent: () =>
      import('./layout/company-shell/company-shell.component')
        .then(m => m.CompanyShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/company/company')
            .then(m => m.CompanyDashboardComponent)
      },
      {
        path: 'candidatures',
        loadComponent: () =>
          import('./backoffice/company-candidatures/company-candidatures.component')
            .then(m => m.CompanyCandidaturesComponent)
      },
      {
        path: 'work-post',
        loadComponent: () =>
          import('./backoffice/work-post/work-post')
            .then(m => m.WorkPost)
      },
      {
        path: 'work-post/:id',
        loadComponent: () =>
          import('./backoffice/work-post-detail/work-post-detail')
            .then(m => m.WorkPostDetail)
      },
      {
        path: 'projects',
        loadChildren: () =>
          import('./features/projects/projects.routes')
            .then(m => m.PROJECTS_ROUTES)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/users/my-profile/my-profile')
            .then(m => m.MyProfile)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

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
          import('./backoffice/admin-candidatures/admin-candidatures.component')
            .then(m => m.AdminCandidaturesComponent)
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
          import('./backoffice/admin-candidatures/admin-candidatures.component')
            .then(m => m.AdminCandidaturesComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'app',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', redirectTo: '/student/dashboard', pathMatch: 'full' },
      { path: 'dashboard/student', redirectTo: '/student/dashboard', pathMatch: 'full' },
      { path: 'candidatures', redirectTo: '/student/candidatures', pathMatch: 'full' },
      { path: 'new-candidature', redirectTo: '/student/new-candidature', pathMatch: 'full' },
      { path: 'my-company', redirectTo: '/student/my-company', pathMatch: 'full' },
      { path: 'my-workpost/:companyId', redirectTo: '/student/my-workpost/:companyId', pathMatch: 'full' },
      { path: 'projects', redirectTo: '/student/projects', pathMatch: 'full' },
      { path: 'projects/:id', redirectTo: '/student/projects/:id', pathMatch: 'full' },
      { path: 'equipes', redirectTo: '/student/equipes', pathMatch: 'full' },
      { path: 'chat/:roomId', redirectTo: '/student/chat/:roomId', pathMatch: 'full' },
      { path: 'profile', redirectTo: '/student/profile', pathMatch: 'full' },
      { path: '', redirectTo: '/student/dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/landing' }
];
