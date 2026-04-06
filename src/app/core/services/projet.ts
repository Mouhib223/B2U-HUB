import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjetService {

  private apiUrl = 'http://localhost:8080/api/projets';

  constructor(private http: HttpClient) {}

  // GET tous les projets
  getAllProjets(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  // GET un projet par ID
  getProjetById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`);
  }

  // POST créer un projet
  createProjet(projet: Project): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, projet);
  }

  // PUT modifier un projet
  updateProjet(id: string, projet: Project): Observable<Project> {
    return this.http.put<Project>(`${this.apiUrl}/${id}`, projet);
  }

  // DELETE supprimer un projet
  deleteProjet(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}