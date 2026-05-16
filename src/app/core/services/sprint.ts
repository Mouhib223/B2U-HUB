import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Sprint {
  id: string;
  projetId: string;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  status: string;
  taskIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class SprintService {

  private apiUrl = 'http://localhost:8080/api/sprints';

  constructor(private http: HttpClient) {}

  getSprintsByProjet(projetId: string): Observable<Sprint[]> {
    return this.http.get<Sprint[]>(`${this.apiUrl}/projet/${projetId}`);
  }

  generateSprints(projetId: string): Observable<Sprint[]> {
    return this.http.post<Sprint[]>(`${this.apiUrl}/generate/${projetId}`, {});
  }

  updateSprint(id: string, sprint: Sprint): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.apiUrl}/${id}`, sprint);
  }

  deleteSprint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
