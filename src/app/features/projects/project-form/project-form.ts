import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProjetService } from '../../../core/services/projet';
import { AuthService } from '../../../core/services/auth.service';
import { AiAssistantService } from '../../../core/services/ai-assistant.service';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './project-form.html',
  styleUrls: ['./project-form.scss']
})
export class ProjectFormComponent implements OnInit {
  isEditMode = false;
  projectId: string | null = null;
  skillInput = '';
  aiLoading = false;
  aiError = '';
  sector = '';

  project: Partial<Project> = {
    title: '',
    description: '',
    type: 'PROJET',
    companyName: '',
    companyId: '',
    requiredSkills: [],
    teamSize: 1,
    status: 'open',
    applicantsCount: 0,
    deadline: new Date(),
    createdAt: new Date()
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projetService: ProjetService,
    private authService: AuthService,
    private aiService: AiAssistantService
  ) {}

  get projectListRoute(): string {
    return this.router.url.startsWith('/company') ? '/company/projects' : '/student/projects';
  }

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
    if (this.projectId) {
      this.isEditMode = true;
      this.projetService.getProjetById(this.projectId).subscribe({
        next: (data) => this.project = data
      });
    } else {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role === 'company') {
        this.project.companyId = currentUser.id;
        this.project.companyName = currentUser.companyName || `${currentUser.firstName} ${currentUser.lastName}`.trim();
      }
    }
  }

  addSkill(): void {
    if (this.skillInput.trim() && !this.project.requiredSkills?.includes(this.skillInput.trim())) {
      this.project.requiredSkills?.push(this.skillInput.trim());
      this.skillInput = '';
    }
  }

  removeSkill(skill: string): void {
    this.project.requiredSkills = this.project.requiredSkills?.filter(s => s !== skill);
  }

  generateWithAI(): void {
    if (!this.project.title?.trim()) {
      this.aiError = 'Entrez un titre avant de générer.';
      return;
    }
    this.aiLoading = true;
    this.aiError = '';
    this.aiService.generateProjectDescription(this.project.title!, this.sector || 'Technologie').subscribe({
      next: (result) => {
        this.project.description = result.description;
        this.project.requiredSkills = result.requiredSkills;
        this.aiLoading = false;
      },
      error: () => {
        this.aiError = 'Erreur lors de la génération IA. Réessayez.';
        this.aiLoading = false;
      }
    });
  }

  submit(): void {
    if (this.isEditMode && this.projectId) {
      this.projetService.updateProjet(this.projectId, this.project as Project).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route })
      });
    } else {
      this.projetService.createProjet(this.project as Project).subscribe({
        next: () => this.router.navigate(['..'], { relativeTo: this.route })
      });
    }
  }
}
