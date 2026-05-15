import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkPostService } from '../../core/services/workpost.service';
import { WorkPost } from '../../core/models/workPost.model';
import { ProjetService } from '../../core/services/projet';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'b2u-student-workpost',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-workpost.html',
  styleUrls: ['./student-workpost.scss']
})
export class StudentWorkpost implements OnInit {
  workPosts: WorkPost[] = [];
  projectMap: { [workPostId: string]: Project } = {};
  loading = false;
  errorMessage = '';
  companyName = '';
  companyId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workPostService: WorkPostService,
    private projetService: ProjetService
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('companyId')!;
    const state = history.state as { companyName: string };
    this.companyName = state?.companyName || 'cette entreprise';

    if (this.companyId) {
      this.loadWorkPosts();
    } else {
      this.errorMessage = 'Aucune entreprise sélectionnée. Retournez à la liste.';
    }
  }

  loadWorkPosts(): void {
    this.loading = true;
    this.workPostService.getAll().subscribe({
      next: (allPosts) => {
        this.workPosts = allPosts.filter(p => p.entrepriseId === this.companyId);
        this.loadProjects();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur getAll', err);
        this.errorMessage = 'Erreur chargement des offres.';
        this.loading = false;
      }
    });
  }

  loadProjects(): void {
    this.workPosts.forEach(post => {
      if (post.projetId && post.id) {
        this.projetService.getProjetById(post.projetId).subscribe({
          next: (project) => {
            this.projectMap[post.id!] = project;
          },
          error: () => {}
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student/my-company']);
  }

  applyForPost(post: WorkPost): void {
    this.router.navigate(['/student/new-candidature'], {
      queryParams: { projectId: post.projetId },
      state: {
        projectId: post.projetId,
        workPostId: post.id,
        workPostTitle: post.title,
        companyId: this.companyId,
        companyName: this.companyName
      }
    });
  }
}
