import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { WorkPostService } from '../../core/services/workpost.service';
import { WorkPost } from '../../core/models/workPost.model';
import { ProjetService } from '../../core/services/projet'; // ✅
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'b2u-work-post-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './work-post-detail.html',
  styleUrls: ['./work-post-detail.scss']
})
export class WorkPostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workPostService = inject(WorkPostService);
  private projetService = inject(ProjetService); // ✅

  post: WorkPost | null = null;
  assignedProject: Project | null = null;
  allProjects: Project[] = [];
  selectedProjectId: string = '';
  isLoading = false;
  showAssignPanel = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPost(id);
    this.loadAllProjects();
  }

  loadPost(id: string): void {
    this.isLoading = true;
    this.workPostService.getById(id).subscribe({
      next: (data) => {
        this.post = data;
        if (data.projetId) {
          this.loadAssignedProject(data.projetId);
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  loadAllProjects(): void {
    this.projetService.getAllProjets().subscribe({ // ✅ getAllProjets()
      next: (data) => { this.allProjects = data; }
    });
  }

  loadAssignedProject(projetId: string): void {
    this.projetService.getProjetById(projetId).subscribe({ // ✅ getProjetById()
      next: (p) => { this.assignedProject = p; }
    });
  }

  assign(): void {
    if (!this.post?.id || !this.selectedProjectId) return;
    this.isLoading = true;
    this.workPostService.assignProjet(this.post.id, this.selectedProjectId).subscribe({
      next: (updated) => {
        this.post = updated;
        this.loadAssignedProject(this.selectedProjectId);
        this.showAssignPanel = false;
        this.selectedProjectId = '';
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  unassign(): void {
    if (!this.post?.id) return;
    if (!confirm('Retirer le projet affecté ?')) return;
    this.isLoading = true;
    this.workPostService.unassignProjet(this.post.id).subscribe({
      next: (updated) => {
        this.post = updated;
        this.assignedProject = null;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/company/work-post']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':  return 'accepted';
      case 'FILLED':  return 'filled';
      case 'EXPIRED': return 'rejected';
      default:        return 'pending';
    }
  }
}