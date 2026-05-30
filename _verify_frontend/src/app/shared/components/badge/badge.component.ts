import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'b2u-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="type">{{ label }}</span>`,
  styles: [`
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .open      { background: #D1FAE5; color: #065F46; }
    .closed    { background: #FEE2E2; color: #991B1B; }
    .pending   { background: #FEF3C7; color: #92400E; }
    .active    { background: #DBEAFE; color: #1E40AF; }
  `]
})
export class BadgeComponent {
  @Input() label = '';
  @Input() type: 'open' | 'closed' | 'pending' | 'active' = 'active';
}