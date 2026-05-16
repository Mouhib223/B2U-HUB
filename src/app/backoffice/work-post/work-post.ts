import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { WorkPostService } from '../../core/services/workpost.service';
import { WorkPost as WorkPostModel } from '../../core/models/workPost.model'; // alias
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'b2u-work-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './work-post.html',
  styleUrls: ['./work-post.scss']
})
export class WorkPost implements OnInit {
  private workPostService = inject(WorkPostService);
  private auth = inject(AuthService);

  private router = inject(Router);

  posts: WorkPostModel[] = [];
  recommendedPosts: WorkPostModel[] = [];
  selectedPost: WorkPostModel | null = null;
  newPost: WorkPostModel = this.emptyPost();
  statusFilter: string = '';
  searchTerm: string = '';
  showFormPanel: boolean = true;
  isLoading: boolean = false;

  aiTitle: string = '';
  aiSector: string = '';
  isGenerating: boolean = false;

  get formModel(): WorkPostModel {
    return this.selectedPost ?? this.newPost;
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  emptyPost(): WorkPostModel {
    return {
      title: '',
    hoursPerWeek: 0,
    requiredSkills: '',
    status: 'ACTIVE',
    workMode: 'HYBRID' 
    };
  }

  loadPosts(): void {
    this.isLoading = true;
    this.workPostService.getMine().subscribe({
      next: (data) => { this.posts = data; this.isLoading = false; },
      error: (err) => { console.error('Failed to load posts', err); this.isLoading = false; }
    });
  }

  get filteredPosts(): WorkPostModel[] {
    return this.posts.filter(post => {
      const matchesStatus = !this.statusFilter || post.status === this.statusFilter;
      const matchesSearch = !this.searchTerm ||
        post.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        post.requiredSkills.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }

  get totalPosts(): number { return this.posts.length; }
  get activePosts(): number { return this.posts.filter(p => p.status === 'ACTIVE').length; }
  get filledPosts(): number { return this.posts.filter(p => p.status === 'FILLED').length; }
  get expiredPosts(): number { return this.posts.filter(p => p.status === 'EXPIRED').length; }

  createPost(): void {
    this.isLoading = true;
    this.workPostService.create(this.newPost).subscribe({
    next: (created: WorkPostModel) => {
      this.posts.unshift(created);
      this.newPost = this.emptyPost();
      this.isLoading = false;
    },
    error: (err: any) => {
      console.error('Create failed', err);
      this.isLoading = false;
    }
  });
}

  editPost(post: WorkPostModel): void {
    this.selectedPost = { ...post };
    this.showFormPanel = true;
  }

  updatePost(): void {
    if (!this.selectedPost || !this.selectedPost.id) return;
    this.isLoading = true;
    this.workPostService.update(this.selectedPost.id, this.selectedPost).subscribe({
      next: (updated: WorkPostModel) => {
        const index = this.posts.findIndex(p => p.id === updated.id);
        if (index !== -1) this.posts[index] = updated;
        this.selectedPost = null;
        this.isLoading = false;
        this.showFormPanel = true;
      },
      error: (err: any) => {
        console.error('Update failed', err);
        this.isLoading = false;
      }
    });
  }

  deletePost(id: string): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    this.isLoading = true;
    this.workPostService.delete(id).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        this.isLoading = false;
      }
    });
  }

  cancelForm(): void {
    this.selectedPost = null;
    this.newPost = this.emptyPost();
    this.showFormPanel = false;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'accepted';
      case 'FILLED': return 'filled';
      case 'EXPIRED': return 'rejected';
      case 'CLOSED': return 'rejected';
      default: return 'pending';
    }
  }

  generateWithAI(): void {
  if (!this.aiTitle || !this.aiSector) return;
  
  this.isGenerating = true;
  this.workPostService.generate(this.aiTitle, this.aiSector).subscribe({
    next: (generated: WorkPostModel) => {

      this.newPost = {
        ...generated,
        id: undefined,
        entrepriseId: undefined,
        createdAt: undefined
      };
      this.selectedPost = null;
      this.showFormPanel = true;
      this.isGenerating = false;
    },
    error: (err: any) => {
      console.error('AI generation failed', err);
      this.isGenerating = false;
    }
  });
}

viewDetail(post: WorkPostModel): void {
  this.router.navigate(['/company/work-post', post.id]);
}
}