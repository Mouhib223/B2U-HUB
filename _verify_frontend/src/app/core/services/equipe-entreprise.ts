import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EquipeEntrepriseService {

  private equipeUrl = 'http://localhost:8080/equipe';
  private entrepriseUrl = 'http://localhost:8080/api/entreprise';

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────────
  // GESTION DES ENTREPRISES
  // ─────────────────────────────────────────────────────────────

  /**
   * Récupérer toutes les entreprises
   */
  getAllEntreprises(): Observable<any[]> {
    return this.http.get<any[]>(`${this.entrepriseUrl}/getAll`);
  }

  /**
   * Récupérer une entreprise par son ID
   */
  getEntrepriseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.entrepriseUrl}/getById/${id}`);
  }

  // ─────────────────────────────────────────────────────────────
  // LIAISON ÉQUIPE ↔ ENTREPRISE
  // ─────────────────────────────────────────────────────────────

  /**
   * Associer une entreprise à une équipe
   */
  associerEntreprise(equipeId: string, entrepriseId: string): Observable<any> {
    return this.http.put(`${this.equipeUrl}/${equipeId}/associer-entreprise/${entrepriseId}`, {});
  }

  /**
   * Récupérer toutes les équipes d'une entreprise
   */
  getEquipesByEntreprise(entrepriseId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.equipeUrl}/by-entreprise/${entrepriseId}`);
  }

  // ─────────────────────────────────────────────────────────────
  // GESTION DES PROJETS JIRA
  // ─────────────────────────────────────────────────────────────

  /**
   * Créer un projet Jira pour une équipe
   */
  createJiraProject(equipeId: string): Observable<any> {
    return this.http.post(`${this.equipeUrl}/${equipeId}/jira/create-project`, {});
  }

  // ─────────────────────────────────────────────────────────────
  // GESTION DES TÂCHES (pour l'entreprise)
  // ─────────────────────────────────────────────────────────────

  /**
   * Créer une nouvelle tâche et l'assigner à un étudiant
   * POST /equipe/{equipeId}/tasks/add
   */
  createTask(equipeId: string, taskData: { title: string; description: string; assignedTo: string }): Observable<any> {
    const payload = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo
    };
    return this.http.post(`${this.equipeUrl}/${equipeId}/tasks/add`, payload);
  }

  /**
   * Assigner une tâche existante à un étudiant
   * PUT /equipe/{equipeId}/tasks/{taskIndex}/assign
   */
  assignTask(equipeId: string, taskIndex: number, studentId: string): Observable<any> {
    return this.http.put(`${this.equipeUrl}/${equipeId}/tasks/${taskIndex}/assign`, { studentId });
  }

  /**
   * Supprimer une tâche
   * DELETE /equipe/{equipeId}/tasks/{taskIndex}
   */
  deleteTask(equipeId: string, taskIndex: number): Observable<any> {
    return this.http.delete(`${this.equipeUrl}/${equipeId}/tasks/${taskIndex}`);
  }

  /**
   * Mettre à jour le statut d'une tâche
   * PUT /equipe/{equipeId}/tasks/{taskIndex}/status
   */
  updateTaskStatus(equipeId: string, taskIndex: number, status: string): Observable<any> {
    return this.http.put(`${this.equipeUrl}/${equipeId}/tasks/${taskIndex}/status`, { status });
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTHODES SUPPLÉMENTAIRES UTILES
  // ─────────────────────────────────────────────────────────────

  /**
   * Récupérer toutes les tâches d'une équipe
   */
  getAllTasks(equipeId: string): Observable<any> {
    return this.http.get(`${this.equipeUrl}/${equipeId}/tasks`);
  }

  /**
   * Récupérer les tâches assignées à un étudiant spécifique
   * GET /equipe/{equipeId}/tasks/assigned/{studentId}
   */
  getTasksByStudent(equipeId: string, studentId: string): Observable<any> {
    return this.http.get(`${this.equipeUrl}/${equipeId}/tasks/assigned/${studentId}`);
  }

  /**
   * Récupérer les statistiques des tâches d'une équipe
   * GET /equipe/{equipeId}/tasks/stats
   */
  getTaskStats(equipeId: string): Observable<any> {
    return this.http.get(`${this.equipeUrl}/${equipeId}/tasks/stats`);
  }

  /**
   * Récupérer les détails complets d'une équipe (avec ses tâches)
   * GET /equipe/{equipeId}
   */
  getEquipeById(equipeId: string): Observable<any> {
    return this.http.get(`${this.equipeUrl}/${equipeId}`);
  }

  /**
   * Récupérer toutes les équipes
   * GET /equipe/all
   */
  getAllEquipes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.equipeUrl}/all`);
  }
}