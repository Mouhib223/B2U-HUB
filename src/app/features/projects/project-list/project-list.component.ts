import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { Project } from '../../../core/models/project.model';

@Component({
  selector: 'b2u-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule, BadgeComponent],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  searchQuery = '';

  projects: Project[] = [
    {
      id: '1', title: 'React Dashboard for FinTech Startup',
      description: 'Build an analytics dashboard with real-time data visualization.',
      companyId: 'c1', companyName: 'FinTech Corp',
      requiredSkills: ['React', 'TypeScript', 'Chart.js'],
      teamSize: 3, deadline: new Date('2025-08-01'),
      status: 'open', applicantsCount: 8, createdAt: new Date()
    },
    {
      id: '2', title: 'AI Chatbot Integration',
      description: 'Integrate an NLP-powered chatbot into an existing e-commerce platform.',
      companyId: 'c2', companyName: 'ShopAI',
      requiredSkills: ['Python', 'NLP', 'REST API'],
      teamSize: 2, deadline: new Date('2025-07-15'),
      status: 'open', applicantsCount: 12, createdAt: new Date()
    },
    {
      id: '3', title: 'Mobile App for University Events',
      description: 'Design and develop a cross-platform mobile app for campus events.',
      companyId: 'c3', companyName: 'UniTech',
      requiredSkills: ['Flutter', 'Dart', 'Firebase'],
      teamSize: 4, deadline: new Date('2025-09-01'),
      status: 'open', applicantsCount: 5, createdAt: new Date()
    },
  ];

  get filtered() {
    if (!this.searchQuery) return this.projects;
    const q = this.searchQuery.toLowerCase();
    return this.projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.requiredSkills.some(s => s.toLowerCase().includes(q))
    );
  }
}