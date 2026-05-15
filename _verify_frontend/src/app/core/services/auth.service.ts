import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('b2u_user');
    if (stored) this.currentUserSubject.next(JSON.parse(stored));
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        // res = { token, id, firstName, lastName, email, role }
        localStorage.setItem('b2u_token', res.token);
        const user: User = {
          id:        res.id,
          firstName: res.firstName,
          lastName:  res.lastName,
          email:     res.email,
          role:      this.mapRole(res.role),
          createdAt: new Date()
        };
        localStorage.setItem('b2u_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, {
      firstName: data.firstName,
      lastName:  data.lastName,
      email:     data.email,
      password:  data.password,
      role:      data.role  // 'student' | 'company' | 'admin'
    }, { responseType: 'text' });
  }

  logout(): void {
    localStorage.removeItem('b2u_token');
    localStorage.removeItem('b2u_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/landing']);
  }

  isLoggedIn(): boolean { return !!localStorage.getItem('b2u_token'); }
  getCurrentUser(): User | null { return this.currentUserSubject.value; }
  getToken(): string | null { return localStorage.getItem('b2u_token'); }

  updateCurrentUser(partial: Partial<User>): void {
    const current = this.currentUserSubject.value;
    if (!current) return;
    const updated = { ...current, ...partial };
    localStorage.setItem('b2u_user', JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  // Convertit ROLE_ADMIN → 'admin', ROLE_COMPANY → 'company', ROLE_STUDENT → 'student'
  private mapRole(backendRole: string): string {
    switch (backendRole?.toUpperCase()) {
      case 'ROLE_ADMIN':   return 'admin';
      case 'ROLE_COMPANY': return 'company';
      default:             return 'student';
    }
  }
}
