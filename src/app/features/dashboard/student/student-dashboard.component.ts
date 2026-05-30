import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { StatsCardComponent } from '../../../shared/components/stats-card/stats-card.component';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { AIScoringService } from '../../../core/services/ai-scoring.service';

@Component({
  selector: 'b2u-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, StatsCardComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  user: User | null = null;
  aiScore = 0;
  aiRank = 'N/A';
  aiEvalId = '';

  stats = [
    { label: 'Candidatures envoyees', value: 12, icon: 'send', change: 25, iconBg: '#EBF5FF', iconColor: '#1A56DB' },
    { label: 'Projets actifs', value: 3, icon: 'work', change: 0, iconBg: '#F3FAF7', iconColor: '#0E9F6E' },
    { label: 'AI Score', value: 78, icon: 'analytics', change: 5, iconBg: '#FDF4FF', iconColor: '#7E3AF2' },
    { label: 'Vues du profil', value: 47, icon: 'visibility', change: -3, iconBg: '#FFF8F1', iconColor: '#D97706' },
  ];

  recentActivity = [
    { text: 'Candidature envoyee pour "React Developer for FinTech App"', time: 'Il y a 2 heures', icon: 'send' },
    { text: 'Votre candidature pour "AI Chatbot Project" a ete acceptee', time: 'Il y a 1 jour', icon: 'check_circle' },
    { text: 'Un nouveau projet correspond a vos competences', time: 'Il y a 3 jours', icon: 'work' },
  ];

  constructor(private auth: AuthService, private scoringService: AIScoringService) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    const studentId = this.user?.id || '1';

    this.scoringService.getLatestScore(studentId).subscribe({
      next: score => {
        this.aiScore = score.overallScore;
        this.aiRank = score.rank;
        this.aiEvalId = score.idEval ?? '';
      },
      error: () => {
        this.aiScore = 0;
        this.aiRank = 'N/A';
      }
    });
  }
}
