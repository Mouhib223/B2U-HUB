/*import { Component } from '@angular/core';
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
  sidebarCollapsed = false;

  menuItems = [
    { label: 'Dashboard',     icon: 'dashboard',   route: '/admin/dashboard'     },
    { label: 'Users',         icon: 'people',      route: '/admin/users'         },
    { label: 'Projects',      icon: 'work',        route: '/admin/projects'      },
    { label: 'Applications',  icon: 'assignment',  route: '/admin/applications'  },
  ];

  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}*/
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

  menuItems = [
  { label: 'Dashboard',    icon: 'dashboard',   route: '/admin/dashboard'    },
  { label: 'Users',        icon: 'people',      route: '/admin/users'        },
  { label: 'Projects',     icon: 'work',        route: '/admin/projects'     },
  { label: 'Applications', icon: 'assignment',  route: '/admin/applications' },
  { label: 'Companies',    icon: 'business',    route: '/admin/companies'    },
  { label: 'Candidatures', icon: 'description', route: '/admin/candidatures' },
  { label: 'Evaluations',  icon: 'analytics',   route: '/admin/evaluations'  }, // ← ADD THIS
  ];
  /*menuItems = [
    { label: 'Dashboard',    icon: 'dashboard',  route: '/admin/dashboard'    },
    { label: 'Users',        icon: 'people',     route: '/admin/users'        },
    { label: 'Projects',     icon: 'work',       route: '/admin/projects'     },

    { label: 'Applications', icon: 'assignment', route: '/admin/applications' },
    { label: 'Companies',    icon: ' corporate_fare', route: '/admin/companies'    },

    { label: 'Candidatures',  icon: 'description', route: '/admin/candidatures'  },

  ];*/

  logout() {
    this.auth.logout();
  }
}