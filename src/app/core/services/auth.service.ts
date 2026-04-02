/*import { Injectable } from '@angular/core';
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
    return this.http.post<{ token: string; user: User }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('b2u_token', res.token);
        localStorage.setItem('b2u_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('b2u_token');
    localStorage.removeItem('b2u_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('b2u_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('b2u_token');
  }
}*/



/*import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private userKey = 'user';
  private tokenKey = 'token';*/

  // ✅ LOGIN
  /*login(email: string, password: string): Observable<any> {
    if (email === 'test@test.com' && password === '123456') {
      const user = { email, role: 'student' };
      const token = 'fake-jwt-token';

      localStorage.setItem(this.userKey, JSON.stringify(user));
      localStorage.setItem(this.tokenKey, token);

      return of({ token, user }).pipe(delay(800));
    } else {
      return throwError(() => ({
        error: { message: 'Invalid credentials' }
      }));
    }
  }*/
  /*login(email: string, password: string): Observable<any> {
  return this.http.post<{ token: string; user: User }>(
    `${environment.apiUrl}/auth/login`,
    { email, password }
  ).pipe(
    tap(res => {
      localStorage.setItem('b2u_token', res.token);
      localStorage.setItem('b2u_user', JSON.stringify(res.user));
      this.currentUserSubject.next(res.user);
    })
  );
}

  // ✅ REGISTER
  register(data: any): Observable<any> {
    console.log('REGISTER DATA:', data);

    return of({
      message: 'User registered successfully'
    }).pipe(delay(800));
  }

  // ✅ CHECK LOGIN
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  // ✅ GET TOKEN
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // ✅ GET USER
  getCurrentUser(): any {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  // ✅ LOGOUT
  logout(): void {
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
  }
}*/
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
    return this.http.post<{ token: string; user: User }>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        localStorage.setItem('b2u_token', res.token);
        localStorage.setItem('b2u_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, data);
  }

  logout(): void {
    localStorage.removeItem('b2u_token');
    localStorage.removeItem('b2u_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('b2u_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('b2u_token');
  }
}