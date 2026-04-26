import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidature } from '../models/candidature.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CandidatureService {
  private url = `${environment.apiUrl}/api/candidatures`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.url);
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

  createWithFiles(formData: FormData): Observable<Candidature> {
    return this.http.post<Candidature>(this.url, formData);
  }

  update(id: string, dto: Candidature): Observable<Candidature> {
    return this.http.put<Candidature>(`${this.url}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
