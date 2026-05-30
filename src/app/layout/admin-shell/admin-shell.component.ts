import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'b2u-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.scss']
})
export class AdminShellComponent {
  private auth = inject(AuthService);

  sidebarCollapsed = false;
  user$ = this.auth.currentUser$;

  menuItems = [
    { label: 'Dashboard',    icon: 'dashboard',   route: '/admin/dashboard'    },
    { label: 'Utilisateurs', icon: 'people',      route: '/admin/users'        },
    { label: 'Projets',      icon: 'work',        route: '/admin/projects'     },
   // { label: 'Applications', icon: 'assignment',  route: '/admin/applications' },
    { label: 'Entreprises',  icon: 'business',    route: '/admin/companies'    },
    { label: 'Candidatures', icon: 'description', route: '/admin/candidatures' },
    { label: 'Evaluations',  icon: 'analytics',   route: '/admin/evaluations'  },
    { label: 'Equipes',      icon: 'groups',      route: '/admin/equipes'      },
  ];

  initials(firstName?: string, lastName?: string): string {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'AD';
  }

  logout() {
    this.auth.logout();
  }
}
