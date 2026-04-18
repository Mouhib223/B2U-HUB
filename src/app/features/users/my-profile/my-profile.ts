import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

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
}
