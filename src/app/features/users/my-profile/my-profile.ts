import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'b2u-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss'
})
export class MyProfile {
  private auth = inject(AuthService);
  user = this.auth.getCurrentUser();

  get initials(): string {
    return `${this.user?.firstName?.charAt(0) || ''}${this.user?.lastName?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  get fullName(): string {
    return `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim() || 'Utilisateur';
  }

  get roleLabel(): string {
    if (this.user?.role === 'company') return 'Company';
    if (this.user?.role === 'admin') return 'Admin';
    return 'Student';
  }

  primaryRoute(user: User): string {
    if (user.role === 'company') return '/company/candidatures';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/student/candidatures';
  }

  primaryLabel(user: User): string {
    if (user.role === 'company') return 'Candidatures reçues';
    if (user.role === 'admin') return 'Dashboard admin';
    return 'Mes candidatures';
  }

  primaryIcon(user: User): string {
    if (user.role === 'company') return 'people';
    if (user.role === 'admin') return 'admin_panel_settings';
    return 'description';
  }

  logout(): void {
    this.auth.logout();
  }
}
