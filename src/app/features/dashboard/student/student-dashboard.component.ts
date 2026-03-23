import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'b2u-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, StatsCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: User | null = null;

  stats = [
    { label: 'Applications Sent', value: 12, icon: 'send',       change: 25,  iconBg: '#EBF5FF', iconColor: '#1A56DB' },
    { label: 'Active Projects',   value: 3,  icon: 'work',       change: 0,   iconBg: '#F3FAF7', iconColor: '#0E9F6E' },
    { label: 'AI Score',          value: 78, icon: 'analytics',  change: 5,   iconBg: '#FDF4FF', iconColor: '#7E3AF2' },
    { label: 'Profile Views',     value: 47, icon: 'visibility', change: -3,  iconBg: '#FFF8F1', iconColor: '#D97706' },
  ];

  recentActivity = [
    { text: 'You applied to "React Developer for FinTech App"', time: '2 hours ago', icon: 'send' },
    { text: 'Your application for "AI Chatbot Project" was accepted', time: '1 day ago', icon: 'check_circle' },
    { text: 'New project matching your skills was posted', time: '3 days ago', icon: 'work' },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit() { this.user = this.auth.getCurrentUser(); }
}