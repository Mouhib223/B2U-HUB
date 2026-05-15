import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkPostService } from '../../core/services/workpost.service';
import { WorkPost } from '../../core/models/workPost.model';


@Component({
  selector: 'b2u-student-workpost',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-workpost.html',
  styleUrls: ['./student-workpost.scss']
})
export class StudentWorkpost implements OnInit {
  workPosts: WorkPost[] = [];
  loading = false;
  errorMessage = '';
  companyName = '';
  companyId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workPostService: WorkPostService,
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
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur getAll', err);
        this.errorMessage = 'Erreur chargement des offres.';
        this.loading = false;
      }
    });
  }



  goBack(): void {
    this.router.navigate(['/student/my-company']);
  }

  applyForPost(post: WorkPost): void {
    if (!post.projetId) {
      alert('Cette offre n\'a pas encore de projet associé. Revenez plus tard.');
      return;
    }
    this.router.navigate(['/app/candidatures'], {
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
