import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'b2u-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() label = '';
  @Input() value: string | number = 0;
  @Input() icon = 'info';
  @Input() change = 0;
  @Input() iconBg = 'var(--color-primary-light)';
  @Input() iconColor = 'var(--color-primary)';
}