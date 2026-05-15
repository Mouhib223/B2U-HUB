/*import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.getCurrentUser();

    if (user?.role === 'admin') return true;

    // Not admin → send to front office
    this.router.navigate(['/student/dashboard']);
    return false;
  }
}*/
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    // ─── DEV MODE: comment this block out when backend is ready ───
    return true;
    // ──────────────────────────────────────────────────────────────

    const user = this.auth.getCurrentUser();
    if (user?.role === 'admin') return true;
    this.router.navigate(['/student/dashboard']);
    return false;
  }
}
