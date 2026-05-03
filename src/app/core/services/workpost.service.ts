import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkPost } from '../models/workPost.model';

@Injectable({
  providedIn: 'root',
})
export class WorkPostService  {
  
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/workpost';

  create(post: WorkPost): Observable<WorkPost> {
    return this.http.post<WorkPost>(`${this.baseUrl}/add`, post);
  }
  getAll(): Observable<WorkPost[]> {
    return this.http.get<WorkPost[]>(`${this.baseUrl}/all`);
  }
  getByEntreprise(entrepriseId: string): Observable<WorkPost[]> {
    return this.http.get<WorkPost[]>(`${this.baseUrl}/entreprise/${entrepriseId}`);
  }
  update(id: string, post: WorkPost): Observable<WorkPost> {
    return this.http.put<WorkPost>(`${this.baseUrl}/update/${id}`, post);
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
  getRecommended(maxHours: number): Observable<WorkPost[]> {
    return this.http.get<WorkPost[]>(`${this.baseUrl}/recommended?maxHours=${maxHours}`);
  }
  generate(title: string, sector: string): Observable<WorkPost> {
    return this.http.get<WorkPost>(`${this.baseUrl}/generate?title=${title}&sector=${sector}`);
  }
}
