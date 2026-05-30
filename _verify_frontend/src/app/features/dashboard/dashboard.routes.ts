import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: 'student',
    loadComponent: () => import('./student/student-dashboard.component').then(m => m.StudentDashboardComponent)
  },
  {
    path: 'company',
    loadComponent: () => import('./company/company').then(m => m.CompanyDashboardComponent)
  },
  { path: '', redirectTo: 'student', pathMatch: 'full' }
];