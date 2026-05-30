import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: string;
  projetId: string;
  sprintId: string;
  title: string;
  description: string;
  status: string; // "todo", "in-progress", "done"
  assignedTo: string;
  priority: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  getTasksByProjet(projetId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  getTasksBySprint(sprintId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/sprint/${sprintId}`);
  }

  generateBacklog(projetId: string): Observable<Task[]> {
    return this.http.post<Task[]>(`${this.apiUrl}/generate/${projetId}`, {});
  }

  updateTaskStatus(id: string, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}