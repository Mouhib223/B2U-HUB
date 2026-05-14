import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipeService, Equipe, Task } from '../../core/services/equipe.service';
import { EquipeAiService } from '../../core/services/equipe-ai.service';
import { Router } from '@angular/router';

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'b2u-equipe-front',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './equipe-front.html',
  styleUrls: ['./equipe-front.scss'],
})
export class EquipeFront implements OnInit {

  equipes: Equipe[] = [];
  searchQuery = '';
  selectedEquipe: Equipe | null = null;
  
  // ID de l'étudiant connecté (à remplacer par l'ID réel)
  currentStudentId = 'student-123'; // TODO: Récupérer depuis le service d'authentification

  // Chat IA
  messages: ChatMessage[] = [];
  userInput = '';
  aiLoading = false;

  readonly suggestions = [
    'Quelle équipe me correspond ?',
    'Quelles équipes sont disponibles ?',
    'Quelles sont mes tâches ?',
    'Comment changer le statut d\'une tâche ?',
    'Afficher ma progression'
  ];

  constructor(
    private equipeService: EquipeService,
    private equipeAiService: EquipeAiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadEquipes();
    
    // Récupérer l'ID de l'étudiant connecté (à adapter)
    const storedStudentId = localStorage.getItem('userId');
    if (storedStudentId) {
      this.currentStudentId = storedStudentId;
    }
    
    this.messages = [{
      role: 'ai',
      text: 'Bonjour ! Je peux t\'aider à trouver l\'équipe idéale et gérer tes tâches Jira. Les tâches sont créées par ton entreprise, tu peux uniquement changer leur statut (TODO → IN_PROGRESS → DONE).'
    }];
  }

  loadEquipes() {
    this.equipeService.getAll().subscribe({
      next: (data) => this.equipes = data,
      error: (err) => console.error('Erreur chargement équipes:', err)
    });
  }

  get filteredEquipes(): Equipe[] {
    return this.equipes.filter(e =>
      e.nomMembresEquipe?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // ── Chat IA ─────────────────────────────────────────
  sendMessage(text?: string) {
    const msg = text || this.userInput.trim();
    if (!msg) return;
    
    this.messages.push({ role: 'user', text: msg });
    this.userInput = '';
    this.aiLoading = true;

    const lowerMsg = msg.toLowerCase();
    
    // Vérifier si la question concerne les tâches
    if (lowerMsg.includes('tâche') || lowerMsg.includes('task') || lowerMsg.includes('jira')) {
      if (this.selectedEquipe) {
        this.handleTaskQuery(lowerMsg);
      } else {
        this.messages.push({ 
          role: 'ai', 
          text: 'Veuillez d\'abord ouvrir le tableau Jira d\'une équipe pour voir vos tâches. Cliquez sur le bouton "Board" sur une équipe.' 
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
          this.messages.push({ role: 'ai', text: 'Erreur, réessaie dans un moment.' });
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
    
    if (query.includes('mes tâches') || query.includes('mes taches') || query.includes('mes missions')) {
      if (myTasks.length > 0) {
        response = `📋 **Vos tâches assignées :**\n\n` +
                  `• À faire (TODO): ${myTodoTasks.length} tâche(s)\n` +
                  `• En cours (IN_PROGRESS): ${myInProgressTasks.length} tâche(s)\n` +
                  `• Terminé (DONE): ${myDoneTasks.length} tâche(s)\n\n` +
                  `Pour changer le statut d'une tâche, utilisez les boutons dans le tableau Kanban.`;
      } else {
        response = 'Vous n\'avez aucune tâche assignée pour le moment. Les tâches sont créées et assignées par votre entreprise.';
      }
    }
    else if (query.includes('progression') || query.includes('avancement') || query.includes('stats')) {
      const completionRate = myTasks.length > 0 ? Math.round(myDoneTasks.length / myTasks.length * 100) : 0;
      response = `📊 **Votre progression :**\n\n` +
                `• Tâches totales: ${myTasks.length}\n` +
                `• Terminées: ${myDoneTasks.length}\n` +
                `• En cours: ${myInProgressTasks.length}\n` +
                `• À faire: ${myTodoTasks.length}\n` +
                `• Taux d'avancement: ${completionRate}%`;
    }
    else if (query.includes('comment') || query.includes('modifier') || query.includes('changer')) {
      response = 'Pour changer le statut d\'une tâche :\n\n' +
                '1. Cliquez sur "→ En cours" pour passer une tâche de TODO à IN_PROGRESS\n' +
                '2. Cliquez sur "✓ Terminé" pour passer une tâche de IN_PROGRESS à DONE\n' +
                '3. Cliquez sur "← Retour" ou "← Réouvrir" pour revenir en arrière\n\n' +
                'Seules les tâches qui vous sont assignées peuvent être modifiées.';
    }
    else {
      response = 'Vous pouvez gérer vos tâches assignées dans le tableau Kanban.\n\n' +
                '• Les tâches rouges sont à faire (TODO)\n' +
                '• Les tâches jaunes sont en cours (IN_PROGRESS)\n' +
                '• Les tâches vertes sont terminées (DONE)\n\n' +
                'Utilisez les boutons pour changer le statut de vos tâches.';
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

  // ── Navigation ───────────────────────────────────────
  joinTeam(equipe: Equipe) {
    this.router.navigate(['/app/chat', equipe.idEquipe]);
  }

  // ── Board Jira ───────────────────────────────────────
  openBoard(equipe: Equipe): void {
    // Charger les détails complets de l'équipe avec ses tâches
    this.equipeService.getEquipeById(equipe.idEquipe).subscribe({
      next: (data: Equipe) => {
        this.selectedEquipe = data;
        
        // Vérifier si l'étudiant a des tâches assignées
        const myTasks = this.getMyTasks();
        if (myTasks.length === 0) {
          this.messages.push({
            role: 'ai',
            text: `📋 Vous n'avez aucune tâche assignée dans l'équipe **${data.nomMembresEquipe}**.\n\nLes tâches apparaîtront ici une fois que l'entreprise vous les aura assignées.`
          });
        } else {
          this.messages.push({
            role: 'ai',
            text: `✅ Vous avez **${myTasks.length} tâche(s) assignée(s)** dans l'équipe **${data.nomMembresEquipe}**.\n\nUtilisez le tableau ci-dessous pour changer leur statut.`
          });
        }
      },
      error: (err) => console.error('Erreur chargement équipe:', err)
    });
  }

  closeBoard(): void {
    this.selectedEquipe = null;
    this.loadEquipes();
  }

  // Récupérer uniquement les tâches assignées à l'étudiant courant
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
    
    // Vérifier que la tâche est bien assignée à l'étudiant
    if (task.assignedTo !== this.currentStudentId) {
      console.error('Vous ne pouvez modifier que vos propres tâches');
      return;
    }
    
    // Trouver l'index réel dans la liste complète des tâches
    const realIndex = this.selectedEquipe.tasks!.findIndex(t => t === task);
    const oldStatus = task.status;
    task.status = newStatus;

    this.equipeService.updateTaskStatus(
      this.selectedEquipe.idEquipe, realIndex, newStatus
    ).subscribe({
      next: () => {
        // Message de confirmation
        const statusText = newStatus === 'TODO' ? 'À faire' : 
                          newStatus === 'IN_PROGRESS' ? 'En cours' : 'Terminé';
        this.messages.push({
          role: 'ai',
          text: `✅ Tâche "${task.title}" déplacée vers **${statusText}** !`
        });
      },
      error: (err) => {
        console.error('Erreur mise à jour tâche:', err);
        task.status = oldStatus; // Revert en cas d'erreur
        this.messages.push({
          role: 'ai',
          text: `❌ Erreur lors de la mise à jour de la tâche. Veuillez réessayer.`
        });
      }
    });
  }
}