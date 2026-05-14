import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectFilter } from '../models/project.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private api = `${environment.apiUrl}/api/projets`;

  constructor(private http: HttpClient) {}

  getProjects(filter?: ProjectFilter): Observable<Project[]> {
    let params = new HttpParams();
    if (filter?.skills?.length) params = params.set('skills', filter.skills.join(','));
    if (filter?.status)         params = params.set('status', filter.status);
    if (filter?.search)         params = params.set('search', filter.search);
    // Temporairement désactiver l'authentification pour tester
    return this.http.get<Project[]>(this.api, { params });
  }

  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.api}/${id}`);
  }

  createProject(project: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(this.api, project);
  }

  applyToProject(projectId: string, application: any): Observable<any> {
    return this.http.post(`${this.api}/${projectId}/apply`, application);
  }

  getMyProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.api);
  }
}
