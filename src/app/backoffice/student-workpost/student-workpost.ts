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
    private workPostService: WorkPostService
  ) {}

  ngOnInit(): void {
    // 1. Récupérer l'ID depuis l'URL
    this.companyId = this.route.snapshot.paramMap.get('companyId')!;

    // 2. Récupérer le nom depuis le state (optionnel)
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
  // Appel de tous les posts (sans filtre)
  this.workPostService.getAll().subscribe({
    next: (allPosts) => {
      console.log('📦 Tous les posts :', allPosts);
      // Filtrage manuel avec l'ID entreprise
      const filtered = allPosts.filter(p => p.entrepriseId === this.companyId);
      this.workPosts = filtered;
      console.log(`🎯 Posts filtrés pour ${this.companyId} :`, filtered);
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
    this.router.navigate(['/student/new-candidature'], {
      state: {
        workPostId: post.id,
        workPostTitle: post.title,
        companyId: this.companyId,
        companyName: this.companyName
      }
    });
  }
}