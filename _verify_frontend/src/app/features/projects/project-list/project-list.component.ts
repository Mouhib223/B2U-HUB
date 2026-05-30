import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Project } from '../../../core/models/project.model';
import { ProjetService } from '../../../core/services/projet';
import { AuthService } from '../../../core/services/auth.service';
import { AiAssistantService, SkillGapResult } from '../../../core/services/ai-assistant.service';

@Component({
  selector: 'b2u-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, BadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  private projetService = inject(ProjetService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private aiService = inject(AiAssistantService);

  searchQuery = '';
  projects: Project[] = [];
  loading = true;
  error = '';

  gapModal: {
    open: boolean;
    loading: boolean;
    projectId?: string;
    projectTitle?: string;
    result?: SkillGapResult;
    error?: string;
  } = { open: false, loading: false };

  get isStudent(): boolean {
    return this.auth.getCurrentUser()?.role === 'student';
  }

  ngOnInit(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => { this.projects = data; this.loading = false; },
      error: () => { this.error = 'Erreur lors du chargement des projets.'; this.loading = false; }
    });
  }

  get filtered() {
    if (!this.searchQuery) return this.projects;
    const q = this.searchQuery.toLowerCase();
    return this.projects.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      this.projectSkills(p).some(s => s.toLowerCase().includes(q))
    );
  }

  projectSkills(project: Project): string[] {
    return project.requiredSkills?.length ? project.requiredSkills : project.technologies ?? [];
  }

  apply(project: Project, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/app/candidatures'], {
      queryParams: { projectId: project.id }
    });
  }

  analyzeGap(project: Project, event: Event): void {
    event.stopPropagation();
    this.gapModal = { open: true, loading: true, projectId: project.id, projectTitle: project.title };
    this.aiService.analyzeSkillGap(project.id!).subscribe({
      next: (result) => { this.gapModal = { ...this.gapModal, loading: false, result }; },
      error: () => { this.gapModal = { ...this.gapModal, loading: false, error: 'Erreur IA. Réessayez.' }; }
    });
  }

  closeGapModal(): void {
    this.gapModal = { open: false, loading: false };
  }
}
