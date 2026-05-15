import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SprintService, Sprint } from '../../../core/services/sprint';
import { TaskService, Task } from '../../../core/services/task';
import { ProjectAiService, AiAnalysis } from '../../../core/services/project-ai';

@Component({
  selector: 'app-project-management',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './project-management.html',
  styleUrls: ['./project-management.scss']
})
export class ProjectManagementComponent implements OnInit {

  projetId: string = '';
  sprints: Sprint[] = [];
  tasks: Task[] = [];
  aiAnalysis: AiAnalysis | null = null;
  loading = true;
  activeTab = 'kanban';

  constructor(
    private route: ActivatedRoute,
    private sprintService: SprintService,
    private taskService: TaskService,
    private projectAiService: ProjectAiService
  ) {}

  ngOnInit(): void {
    this.projetId = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  loadData(): void {
    // Charger les sprints
    this.sprintService.getSprintsByProjet(this.projetId).subscribe({
      next: (data) => this.sprints = data
    });

    // Charger les tâches
    this.taskService.getTasksByProjet(this.projetId).subscribe({
      next: (data) => {
        this.tasks = data;
        this.loading = false;
      }
    });

    // Charger l'analyse IA
    this.projectAiService.analyzeProject(this.projetId).subscribe({
      next: (data) => this.aiAnalysis = data
    });
  }

  generateSprints(): void {
    this.sprintService.generateSprints(this.projetId).subscribe({
      next: (data) => this.sprints = data
    });
  }

  generateBacklog(): void {
    this.taskService.generateBacklog(this.projetId).subscribe({
      next: (data) => this.tasks = data
    });
  }

  updateStatus(task: Task, status: string): void {
    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) this.tasks[index] = updated;
      }
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  getPriorityLabel(priority: number): string {
    if (priority === 3) return 'high';
    if (priority === 2) return 'medium';
    return 'low';
  }
}