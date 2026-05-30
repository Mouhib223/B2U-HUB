import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EquipeService, Equipe, Task } from '../../core/services/equipe.service';
import { EquipeAiService } from '../../core/services/equipe-ai.service';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'b2u-equipe-front',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './equipe-front.html',
  styleUrls: ['./equipe-front.scss'],
})
export class EquipeFront implements OnInit {
  equipes: Equipe[] = [];
  searchQuery = '';
  selectedEquipe: Equipe | null = null;
  currentStudentId = 'student-123';

  messages: ChatMessage[] = [];
  userInput = '';
  aiLoading = false;

  readonly suggestions = [
    'Quelle equipe me correspond ?',
    'Quelles equipes sont disponibles ?',
    'Quelles sont mes taches ?',
    'Comment changer le statut d une tache ?',
    'Afficher ma progression'
  ];

  constructor(
    private equipeService: EquipeService,
    private equipeAiService: EquipeAiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEquipes();

    const storedStudentId = localStorage.getItem('userId');
    if (storedStudentId) {
      this.currentStudentId = storedStudentId;
    }

    this.messages = [{
      role: 'ai',
      text: 'Bonjour ! Je peux vous aider a trouver une equipe et suivre vos taches Jira. Vous pouvez changer vos taches de TODO vers IN_PROGRESS puis DONE.'
    }];
  }

  loadEquipes() {
    this.equipeService.getAll().subscribe({
      next: data => this.equipes = data,
      error: err => console.error('Erreur chargement equipes:', err)
    });
  }

  get filteredEquipes(): Equipe[] {
    const query = this.searchQuery.toLowerCase();
    return this.equipes.filter(e => e.nomMembresEquipe?.toLowerCase().includes(query));
  }

  sendMessage(text?: string) {
    const msg = text || this.userInput.trim();
    if (!msg) return;

    this.messages.push({ role: 'user', text: msg });
    this.userInput = '';
    this.aiLoading = true;

    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('tache') || lowerMsg.includes('tâche') || lowerMsg.includes('task') || lowerMsg.includes('jira')) {
      if (this.selectedEquipe) {
        this.handleTaskQuery(lowerMsg);
      } else {
        this.messages.push({
          role: 'ai',
          text: 'Ouvrez d abord le tableau Jira d une equipe pour voir vos taches.'
        });
        this.aiLoading = false;
      }
    } else {
      this.equipeAiService.chat(msg, this.equipes, []).subscribe({
        next: (response: string) => {
          this.messages.push({ role: 'ai', text: response });
          this.aiLoading = false;
        },
        error: () => {
          this.messages.push({ role: 'ai', text: 'Erreur, reessayez dans un moment.' });
          this.aiLoading = false;
        }
      });
    }
  }

  handleTaskQuery(query: string): void {
    let response = '';
    const myTasks = this.getMyTasks();
    const myTodoTasks = myTasks.filter(t => t.status === 'TODO');
    const myInProgressTasks = myTasks.filter(t => t.status === 'IN_PROGRESS');
    const myDoneTasks = myTasks.filter(t => t.status === 'DONE');

    if (query.includes('mes taches') || query.includes('mes tâches') || query.includes('mes missions')) {
      if (myTasks.length > 0) {
        response = `**Vos taches assignees :**\n\n` +
          `A faire (TODO): ${myTodoTasks.length} tache(s)\n` +
          `En cours (IN_PROGRESS): ${myInProgressTasks.length} tache(s)\n` +
          `Termine (DONE): ${myDoneTasks.length} tache(s)\n\n` +
          `Pour changer le statut d une tache, utilisez les boutons dans le tableau Kanban.`;
      } else {
        response = 'Vous n avez aucune tache assignee pour le moment. Les taches sont creees et assignees par votre entreprise.';
      }
    } else if (query.includes('progression') || query.includes('avancement') || query.includes('stats')) {
      const completionRate = myTasks.length > 0 ? Math.round(myDoneTasks.length / myTasks.length * 100) : 0;
      response = `**Votre progression :**\n\n` +
        `Taches totales: ${myTasks.length}\n` +
        `Terminees: ${myDoneTasks.length}\n` +
        `En cours: ${myInProgressTasks.length}\n` +
        `A faire: ${myTodoTasks.length}\n` +
        `Taux d avancement: ${completionRate}%`;
    } else if (query.includes('comment') || query.includes('modifier') || query.includes('changer')) {
      response = 'Pour changer le statut d une tache :\n\n' +
        '1. Cliquez sur "En cours" pour passer une tache de TODO a IN_PROGRESS\n' +
        '2. Cliquez sur "Termine" pour passer une tache de IN_PROGRESS a DONE\n' +
        '3. Cliquez sur "Retour" ou "Reouvrir" pour revenir en arriere\n\n' +
        'Seules les taches qui vous sont assignees peuvent etre modifiees.';
    } else {
      response = 'Vous pouvez gerer vos taches assignees dans le tableau Kanban. Utilisez les boutons pour changer le statut de vos taches.';
    }

    this.messages.push({ role: 'ai', text: response });
    this.aiLoading = false;
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.sendMessage();
  }

  formatAiText(text: string): string {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }

  joinTeam(equipe: Equipe) {
    this.router.navigate(['/student/chat', equipe.idEquipe]);
  }

  openBoard(equipe: Equipe): void {
    this.equipeService.getEquipeById(equipe.idEquipe).subscribe({
      next: (data: Equipe) => {
        this.selectedEquipe = data;
        const myTasks = this.getMyTasks();
        this.messages.push({
          role: 'ai',
          text: myTasks.length === 0
            ? `Vous n avez aucune tache assignee dans l equipe **${data.nomMembresEquipe}**.`
            : `Vous avez **${myTasks.length} tache(s) assignee(s)** dans l equipe **${data.nomMembresEquipe}**.`
        });
      },
      error: err => console.error('Erreur chargement equipe:', err)
    });
  }

  closeBoard(): void {
    this.selectedEquipe = null;
    this.loadEquipes();
  }

  getMyTasks(): Task[] {
    return (this.selectedEquipe?.tasks || []).filter(t => t.assignedTo === this.currentStudentId);
  }

  getTasksByStatus(status: string): Task[] {
    return this.getMyTasks().filter(t => t.status === status);
  }

  getTaskCount(status: string): number {
    return this.getTasksByStatus(status).length;
  }

  getCompletionRate(): number {
    const myTasks = this.getMyTasks();
    if (!myTasks.length) return 0;
    const doneCount = myTasks.filter(t => t.status === 'DONE').length;
    return Math.round(doneCount / myTasks.length * 100);
  }

  moveTask(task: Task, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE'): void {
    if (!this.selectedEquipe) return;

    if (task.assignedTo !== this.currentStudentId) {
      console.error('Vous ne pouvez modifier que vos propres taches');
      return;
    }

    const realIndex = this.selectedEquipe.tasks!.findIndex(t => t === task);
    const oldStatus = task.status;
    task.status = newStatus;

    this.equipeService.updateTaskStatus(this.selectedEquipe.idEquipe, realIndex, newStatus).subscribe({
      next: () => {
        const statusText = newStatus === 'TODO' ? 'A faire' : newStatus === 'IN_PROGRESS' ? 'En cours' : 'Termine';
        this.messages.push({ role: 'ai', text: `Tache "${task.title}" deplacee vers **${statusText}**.` });
      },
      error: err => {
        console.error('Erreur mise a jour tache:', err);
        task.status = oldStatus;
        this.messages.push({ role: 'ai', text: 'Erreur lors de la mise a jour de la tache. Veuillez reessayer.' });
      }
    });
  }
}
