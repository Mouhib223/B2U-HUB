import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Equipe {
  idEquipe: string;
  nomMembresEquipe: string;
  descriptionProfil: string;
  status?: string;
  tasks?: Task[];
  entrepriseId?: string;
  jiraProjectKey?: string;
}

export interface Task {
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignedTo?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  completionRate: number;
}

@Injectable({ providedIn: 'root' })
export class EquipeService {

  private api = 'http://localhost:8080/equipe';

  constructor(private http: HttpClient) {}

  // ── CRUD ──

  getAll(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(`${this.api}/all`);
  }

  getEquipeById(id: string): Observable<Equipe> {
    return this.http.get<Equipe>(`${this.api}/${id}`);
  }

  add(data: Partial<Equipe>): Observable<Equipe> {
    return this.http.post<Equipe>(`${this.api}/add`, data);
  }

  update(data: Equipe): Observable<Equipe> {
    return this.http.put<Equipe>(`${this.api}/update`, data);
  }

  delete(id: string): Observable<string> {
    return this.http.delete(`${this.api}/delete/${id}`, { responseType: 'text' });
  }

  // ── Task management ──

  updateTaskStatus(equipeId: string, taskIndex: number, status: string): Observable<any> {
    return this.http.put(
      `${this.api}/${equipeId}/tasks/${taskIndex}/status`,
      { status }
    );
  }

  getTaskStats(equipeId: string): Observable<TaskStats> {
    return this.http.get<TaskStats>(`${this.api}/${equipeId}/tasks/stats`);
  }

  // Récupérer les tâches assignées à un étudiant
  getTasksByStudent(equipeId: string, studentId: string): Observable<any> {
    return this.http.get(`${this.api}/${equipeId}/tasks/assigned/${studentId}`);
  }
}