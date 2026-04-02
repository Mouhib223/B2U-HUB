/*import { Injectable } from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot, RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    // If admin tries to access front office → redirect to back office
    const user = this.auth.getCurrentUser();
    if (user?.role === 'admin' && state.url.startsWith('/app')) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }

    return true;
  }
}*/
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // ─── DEV MODE: comment this block out when backend is ready ───
    return true;
    // ──────────────────────────────────────────────────────────────

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    const user = this.auth.getCurrentUser();
    if (user?.role === 'admin' && state.url.startsWith('/app')) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }
}