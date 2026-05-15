import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Evaluation } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private api = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  create(dto: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.api, dto);
  }

  getAll(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.api);
  }

  getById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.api}/${id}`);
  }

  update(id: string, dto: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.api}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getByStudent(idEtudiant: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.api}/student/${idEtudiant}`);
  }

  validate(id: string): Observable<Evaluation> {
    return this.http.patch<Evaluation>(`${this.api}/${id}/validate`, {});
  }

  autoFromCandidature(body: any): Observable<Evaluation> {
    return this.http.post<Evaluation>(`${this.api}/auto-from-candidature`, body);
  }

  getTeamSummary(idEquipe: string): Observable<any> {
    return this.http.get<any>(`${this.api}/team/${idEquipe}/summary`);
  }
}