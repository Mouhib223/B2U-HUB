import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Project } from '../../../core/models/project.model';
import { ProjetService } from '../../../core/services/projet';

@Component({
  selector: 'b2u-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, BadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  searchQuery = '';
  projects: Project[] = [];
  loading = true;
  error = '';

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    this.projetService.getAllProjets().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des projets.';
        this.loading = false;
      }
    });
  }

  get filtered() {
    if (!this.searchQuery) return this.projects;
    const q = this.searchQuery.toLowerCase();
    return this.projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }
}