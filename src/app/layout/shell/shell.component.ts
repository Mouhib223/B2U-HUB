import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'b2u-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  private auth = inject(AuthService);
  sidebarCollapsed = false;

  user$ = this.auth.currentUser$;

  get user() { return this.auth.getCurrentUser(); }
  get isStudent() { return this.user?.role === 'student'; }
  get isCompany() { return this.user?.role === 'company'; }

  logout() { this.auth.logout(); }
}
