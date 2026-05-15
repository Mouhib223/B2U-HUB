import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EtudiantProfile {
  id?: string;
  userId?: string;
  bio?: string;
  phone?: string;
  university?: string;
  graduationYear?: string;
  specialite?: string;
  linkedin?: string;
  github?: string;
  skills?: string[];
  avatarUrl?: string;
}

export interface UserUpdate {
  firstName?: string;
  lastName?: string;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {

  constructor(private http: HttpClient) {}

  // ── Etudiant profile ──────────────────────────────
  getMyStudentProfile(): Observable<EtudiantProfile> {
    return this.http.get<EtudiantProfile>('/api/etudiant/me');
  }

  updateMyStudentProfile(data: EtudiantProfile): Observable<EtudiantProfile> {
    return this.http.put<EtudiantProfile>('/api/etudiant/me', data);
  }

  // ── Company profile ───────────────────────────────
  getMyCompanyProfile(): Observable<any> {
    return this.http.get<any>('/api/entreprise/me');
  }

  updateMyCompanyProfile(data: any): Observable<any> {
    return this.http.put<any>('/api/entreprise/me', data);
  }

  // ── User base (all roles) ─────────────────────────
  updateMyUserBase(data: UserUpdate): Observable<any> {
    return this.http.put<any>('/api/users/me', data);
  }

  // ── Admin: user management ────────────────────────
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>('/api/users');
  }

  updateUser(id: string, data: any): Observable<any> {
    return this.http.put<any>(`/api/users/${id}`, data);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`/api/users/${id}`);
  }
}
