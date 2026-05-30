import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { EquipeEntrepriseService } from '../core/services/equipe-entreprise';
import { EquipeService, Equipe, Task } from '../core/services/equipe.service';

@Component({
  selector: 'b2u-equipe-entreprise',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
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

  get associatedCount(): number {
    return this.equipes.filter(e => !!e.entrepriseId).length;
  }

  get jiraCount(): number {
    return this.equipes.filter(e => !!e.jiraProjectKey).length;
  }

  get waitingAssociationCount(): number {
    return this.equipes.length - this.associatedCount;
  }

  get selectedTaskTotal(): number {
    return this.selectedEquipe?.tasks?.length || 0;
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
        this.message = 'Erreur: chargement des donnees impossible';
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
      this.message = 'Attention: veuillez choisir une entreprise';
      return;
    }

    this.service.associerEntreprise(equipeId, entrepriseId).subscribe({
      next: () => {
        this.message = 'Succes: entreprise associee avec succes';
        this.selectedEntrepriseId = {};
        this.chargerDonnees();
      },
      error: () => this.message = 'Erreur: association impossible'
    });
  }

  creerProjetJira(equipeId: string): void {
    this.service.createJiraProject(equipeId).subscribe({
      next: (res) => {
        this.jiraResult = res;
        this.message = `Succes: projet Jira cree (${res.projectKey})`;
        this.chargerDonnees();
      },
      error: () => this.message = 'Erreur: creation du projet Jira impossible'
    });
  }

  getNomEntreprise(entrepriseId: string): string {
    const ent = this.entreprises.find(e => e.id === entrepriseId);
    return ent ? ent.name : 'Non associee';
  }

  getStudentName(studentId?: string): string {
    const student = this.students.find(s => s.id === studentId);
    return student ? student.name : 'Non assignee';
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
        this.message = 'Erreur: chargement des taches impossible';
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
            this.message = 'Succes: tache creee et assignee';
            if (this.selectedEquipeIndex >= 0) {
              this.equipes[this.selectedEquipeIndex] = updatedEquipe;
            }
          }
        });
      },
      error: (err) => {
        console.error('Erreur creation:', err);
        this.message = 'Erreur: creation de la tache impossible';
      }
    });
  }

  updateTaskStatus(task: Task, event: Event, taskIndex: number): void {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (!this.selectedEquipe) return;

    this.service.updateTaskStatus(this.selectedEquipe.idEquipe, taskIndex, newStatus).subscribe({
      next: () => {
        task.status = newStatus as any;
        this.message = 'Succes: statut mis a jour';
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
        this.message = 'Succes: tache assignee';
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  deleteTask(taskIndex: number): void {
    if (!this.selectedEquipe) return;
    if (confirm('Supprimer cette tache ?')) {
      this.service.deleteTask(this.selectedEquipe.idEquipe, taskIndex).subscribe({
        next: () => {
          this.equipeService.getEquipeById(this.selectedEquipe!.idEquipe).subscribe({
            next: (updatedEquipe) => {
              this.selectedEquipe = updatedEquipe;
              this.message = 'Succes: tache supprimee';
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
