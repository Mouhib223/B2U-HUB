import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Entreprise {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  sector: string;
}

@Injectable({
  providedIn: 'root'
})
export class EntrepriseService {

  private apiUrl = 'http://localhost:8080/api/entreprise';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/getAll`);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`http://localhost:8080/api/entreprise/delete/${id}`);
  }

  add(company: any): Observable<any> {
    return this.http.post('http://localhost:8080/api/entreprise/add', company);
  }

  update(id: string, company: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/entreprise/update/${id}`, company);
  }

  getTotalCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.apiUrl}/stats/total`);
  }

  getCountBySector(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.apiUrl}/stats/by-sector`);
  }

  getEquipesByEntreprise(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/equipes`);
  }

  getSimilar(id: string): Observable<Entreprise[]> {
    return this.http.get<Entreprise[]>(`${this.apiUrl}/${id}/similar`);
  }
}
