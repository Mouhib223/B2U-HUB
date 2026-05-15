import { Routes } from '@angular/router';

export const PROJECTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./project-form/project-form').then(m => m.ProjectFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./project-form/project-form').then(m => m.ProjectFormComponent)
  },
  {
    path: ':id/manage',
    loadComponent: () => import('./project-management/project-management').then(m => m.ProjectManagementComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./project-detail/project-detail').then(m => m.ProjectDetailComponent)
  }
];