import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EquipeEntrepriseService } from '../core/services/equipe-entreprise';
import { EquipeService, Equipe, Task } from '../core/services/equipe.service';

@Component({
  selector: 'b2u-equipe-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-entreprise.html',
  styleUrls: ['./equipe-entreprise.scss'],
})
export class EquipeEntreprise implements OnInit {

  equipes: Equipe[] = [];
  entreprises: any[] = [];
  jiraResult: any = null;
  message = '';
  isLoading = false;
  selectedEntrepriseId: { [key: number]: string } = {};

  // Gestion des tâches
  showTaskModal = false;
  selectedEquipe: Equipe | null = null;
  selectedEquipeIndex = -1;
  
  students: any[] = [];
  
  newTask = {
    title: '',
    description: '',
    assignedTo: ''
  };

  constructor(
    private service: EquipeEntrepriseService,
    private equipeService: EquipeService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
    this.loadStudents();
  }

  chargerDonnees(): void {
    this.isLoading = true;
    forkJoin({
      equipes: this.equipeService.getAll(),
      entreprises: this.service.getAllEntreprises()
    }).subscribe({
      next: ({ equipes, entreprises }) => {
        this.equipes = equipes;
        this.entreprises = entreprises;
        this.isLoading = false;
      },
      error: () => {
        this.message = '❌ Erreur de chargement des données';
        this.isLoading = false;
      }
    });
  }

  loadStudents(): void {
    this.students = [
      { id: 'student-123', name: 'Saoussen Ben Soltane', email: 'saoussen@example.com' },
      { id: 'student-456', name: 'Ahmed Ben Ali', email: 'ahmed@example.com' },
      { id: 'student-789', name: 'Sarra Ben Salah', email: 'sarra@example.com' }
    ];
  }

  associer(equipeId: string, entrepriseId: string): void {
    if (!entrepriseId) {
      this.message = '⚠️ Veuillez choisir une entreprise';
      return;
    }
    this.service.associerEntreprise(equipeId, entrepriseId).subscribe({
      next: () => {
        this.message = '✅ Entreprise associée avec succès !';
        this.selectedEntrepriseId = {};
        this.chargerDonnees();
      },
      error: () => this.message = '❌ Erreur lors de l\'association'
    });
  }

  creerProjetJira(equipeId: string): void {
    this.service.createJiraProject(equipeId).subscribe({
      next: (res) => {
        this.jiraResult = res;
        this.message = `✅ Projet Jira créé : ${res.projectKey}`;
        this.chargerDonnees();
      },
      error: () => this.message = '❌ Erreur création projet Jira'
    });
  }

  getNomEntreprise(entrepriseId: string): string {
    const ent = this.entreprises.find(e => e.id === entrepriseId);
    return ent ? ent.name : '—';
  }

  openTaskModal(equipe: Equipe, index: number): void {
    this.equipeService.getEquipeById(equipe.idEquipe).subscribe({
      next: (updatedEquipe) => {
        this.selectedEquipe = updatedEquipe;
        this.selectedEquipeIndex = index;
        this.showTaskModal = true;
        this.newTask = { title: '', description: '', assignedTo: '' };
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.message = '❌ Erreur lors du chargement des tâches';
      }
    });
  }

  closeTaskModal(): void {
    this.showTaskModal = false;
    this.selectedEquipe = null;
    this.chargerDonnees();
  }

  canCreateTask(): boolean {
    return this.newTask.title.trim() !== '' && this.newTask.assignedTo !== '';
  }

  createTask(): void {
    if (!this.canCreateTask() || !this.selectedEquipe) return;
    
    this.service.createTask(this.selectedEquipe.idEquipe, this.newTask).subscribe({
      next: () => {
        this.equipeService.getEquipeById(this.selectedEquipe!.idEquipe).subscribe({
          next: (updatedEquipe) => {
            this.selectedEquipe = updatedEquipe;
            this.newTask = { title: '', description: '', assignedTo: '' };
            this.message = '✅ Tâche créée et assignée avec succès !';
            if (this.selectedEquipeIndex >= 0) {
              this.equipes[this.selectedEquipeIndex] = updatedEquipe;
            }
          }
        });
      },
      error: (err) => {
        console.error('Erreur création:', err);
        this.message = '❌ Erreur lors de la création de la tâche';
      }
    });
  }

  updateTaskStatus(task: Task, event: Event, taskIndex: number): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (!this.selectedEquipe) return;
    
    this.service.updateTaskStatus(this.selectedEquipe.idEquipe, taskIndex, newStatus).subscribe({
      next: () => {
        task.status = newStatus as any;
        this.message = '✅ Statut mis à jour';
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  assignTask(task: Task, event: Event, taskIndex: number): void {
    const studentId = (event.target as HTMLSelectElement).value;
    if (!this.selectedEquipe) return;
    
    this.service.assignTask(this.selectedEquipe.idEquipe, taskIndex, studentId).subscribe({
      next: () => {
        task.assignedTo = studentId;
        this.message = '✅ Tâche assignée avec succès';
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  deleteTask(taskIndex: number): void {
    if (!this.selectedEquipe) return;
    if (confirm('Supprimer cette tâche ?')) {
      this.service.deleteTask(this.selectedEquipe.idEquipe, taskIndex).subscribe({
        next: () => {
          this.equipeService.getEquipeById(this.selectedEquipe!.idEquipe).subscribe({
            next: (updatedEquipe) => {
              this.selectedEquipe = updatedEquipe;
              this.message = '✅ Tâche supprimée';
            }
          });
        },
        error: (err) => console.error('Erreur:', err)
      });
    }
  }

  getTaskCount(status: string): number {
    return (this.selectedEquipe?.tasks || []).filter(t => t.status === status).length;
  }
}