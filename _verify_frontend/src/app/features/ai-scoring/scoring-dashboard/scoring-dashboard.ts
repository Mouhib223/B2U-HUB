import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AIScoringService } from '../../../core/services/ai-scoring.service';
import { AIScore } from '../../../core/models/score.model';

@Component({
  selector: 'b2u-scoring-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scoring-page">
      <h1>Your AI Score</h1>
      <div *ngIf="score" class="score-container">
        <div class="overall-score">
          <div class="score-number">{{ score.overallScore }}</div>
          <div class="score-rank">{{ score.rank }} Tier</div>
        </div>
        <div class="skill-scores">
          <div *ngFor="let s of score.skillScores" class="skill-row">
            <span>{{ s.category }}</span>
            <div class="bar-bg">
              <div class="bar-fill" [style.width.%]="s.score"></div>
            </div>
            <span>{{ s.score }}</span>
          </div>
        </div>
        <div class="recommendations">
          <h3>Recommendations</h3>
          <ul>
            <li *ngFor="let r of score.recommendations">{{ r }}</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scoring-page { padding: 0; }
    h1 { font-size: 1.6rem; margin-bottom: 2rem; }
    .score-container { display: flex; flex-direction: column; gap: 2rem; }
    .overall-score { background: var(--color-primary); color: white; border-radius: 16px; padding: 2rem; text-align: center; }
    .score-number { font-size: 4rem; font-weight: 800; }
    .score-rank { font-size: 1.1rem; opacity: 0.85; }
    .skill-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
    .skill-row span:first-child { width: 160px; font-size: 0.875rem; }
    .skill-row span:last-child { width: 30px; font-weight: 700; }
    .bar-bg { flex: 1; height: 8px; background: var(--color-border); border-radius: 999px; }
    .bar-fill { height: 100%; background: var(--color-primary); border-radius: 999px; }
    .recommendations { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 1.5rem; }
    h3 { margin-bottom: 1rem; }
    ul { padding-left: 1.25rem; }
    li { margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text); }
  `]
})
export class ScoringDashboardComponent implements OnInit {
  score: AIScore | null = null;

  constructor(private scoringService: AIScoringService) {}

  ngOnInit() {
    this.scoringService.getMyScore().subscribe(s => this.score = s);
  }
}