import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService, EtudiantProfile } from '../../../core/services/profile.service';

@Component({
  selector: 'b2u-my-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss']
})
export class MyProfile implements OnInit {
  private auth    = inject(AuthService);
  private profile = inject(ProfileService);

  user = this.auth.getCurrentUser();
  studentProfile: EtudiantProfile | null = null;
  companyProfile: any = null;

  get currentUser() {
    return this.user;
  }

  ngOnInit() {
    if (!this.user) return;

    if (this.user.role === 'student') {
      this.profile.getMyStudentProfile().subscribe({
        next: (p) => this.studentProfile = p,
        error: () => {}
      });
    }

    if (this.user.role === 'company') {
      this.profile.getMyCompanyProfile().subscribe({
        next: (c) => this.companyProfile = c,
        error: () => {}
      });
    }
  }

  primaryRoute(user: any): string {
    if (!user) return '/';
    if (user.role === 'student') return '/app/projects';
    if (user.role === 'company') return '/company/work-post';
    return '/admin/users';
  }

  primaryIcon(user: any): string {
    if (!user) return 'home';
    if (user.role === 'student') return 'work';
    if (user.role === 'company') return 'business';
    return 'admin_panel_settings';
  }

  primaryLabel(user: any): string {
    if (!user) return 'Accueil';
    if (user.role === 'student') return 'Voir les offres';
    if (user.role === 'company') return 'Mes offres';
    return 'Gérer les utilisateurs';
  }

  logout(): void {
    this.auth.logout();
  }
}
