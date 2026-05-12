import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Candidature, CandidaturePage } from '../models/candidature.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private url = `${environment.apiUrl}/api/candidatures`;

  constructor(private http: HttpClient) {}

  getBaseUrl(): string {
    return environment.apiUrl;
  }

  getAll(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.url);
  }

  getPaged(page: number, size: number): Observable<{ items: Candidature[]; total: number }> {
    return this.http
      .get<CandidaturePage>(`${this.url}/paged`, { params: { page: String(page), size: String(size) } })
      .pipe(map(r => ({ items: r.content, total: r.totalElements })));
  }

  getByEmail(email: string): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.url}/my`, { params: { email } });
  }

  getById(id: string): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.url}/${id}`);
  }

  create(dto: Candidature): Observable<Candidature> {
    return this.http.post<Candidature>(this.url, dto);
  }

  /**
   * Envoie la candidature avec CV et lettre de motivation.
   * Le backend attend: data (JSON string), cv (file), lettre (file), projectId (string)
   */
  createWithFiles(dto: Omit<Candidature, 'idCandidature'>, cv: File, lettre: File): Observable<Candidature> {
    const fd = new FormData();
    fd.append('data', JSON.stringify(dto));
    fd.append('cv', cv);
    fd.append('lettre', lettre);
    fd.append('projectId', dto.projectId ?? '');
    return this.http.post<Candidature>(`${this.url}/upload`, fd);
  }

  update(id: string, dto: Candidature): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getRanking(projectId: string): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.url}/project/${projectId}/ranking`);
  }

  getStats(projectId: string): Observable<Record<string, any>> {
    return this.http.get<Record<string, any>>(`${this.url}/project/${projectId}/stats`);
  }
}
