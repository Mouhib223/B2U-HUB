import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProjetService } from '../../../core/services/projet';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'b2u-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './project-detail.html',
  styleUrls: ['./project-detail.scss']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projetService.getProjetById(id).subscribe({
        next: (data) => {
          this.project = data;
          this.loading = false;
        },
        error: () => {
          this.error = 'Projet introuvable.';
          this.loading = false;
        }
      });
    }
  }

  projectSkills(project: Project): string[] {
    return project.requiredSkills?.length ? project.requiredSkills : project.technologies ?? [];
  }

  goToManage(): void {
    if (this.project) {
      this.router.navigate(['/app/projects', this.project.id, 'manage']);
    }
  }
}