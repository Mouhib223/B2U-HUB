import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="page-content">
      <a routerLink="/app/projects">← Back to Projects</a>
      <h1>Project Details</h1>
      <p>Project detail page — coming soon.</p>
    </div>
  `
})
export class ProjectDetailComponent {}