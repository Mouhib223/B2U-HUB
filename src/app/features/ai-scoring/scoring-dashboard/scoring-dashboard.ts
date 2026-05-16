/*import { Component, OnInit } from '@angular/core';
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
}*/
////////////////////////////////////////////////////
// 
/*import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AIScoringService } from '../../../core/services/ai-scoring.service';
import { AuthService } from '../../../core/services/auth.service';
import { AIScore } from '../../../core/models/score.model';

@Component({
  selector: 'b2u-scoring-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './scoring-dashboard.html',
  styleUrls: ['./scoring-dashboard.scss']
})
export class ScoringDashboardComponent implements OnInit {
  score: AIScore | null = null;
  stats: any = null;
  evolutionData: AIScore[] = [];
  leaderboard: any[] = [];
  aiFeedback: any = null;
  learningPath: any = null;
  interviewQuestions: string[] = [];
  loading = true;
  activeTab: 'overview' | 'details' | 'evolution' | 'leaderboard' | 'ai' = 'overview';
  showLearningPath = false;
  showInterviewQ = false;

  get rankConfig() {
    const configs: Record<string, any> = {
      BRONZE:   { label: 'Bronze',   emoji: '🥉', color: '#CD7F32', bg: '#FDF3E7' },
      SILVER:   { label: 'Silver',   emoji: '🥈', color: '#9CA3AF', bg: '#F3F4F6' },
      GOLD:     { label: 'Gold',     emoji: '🥇', color: '#F59E0B', bg: '#FFFBEB' },
      PLATINUM: { label: 'Platinum', emoji: '💎', color: '#6366F1', bg: '#EEF2FF' },
    };
    return this.score ? (configs[this.score.rank] ?? configs['BRONZE']) : configs['BRONZE'];
  }

  get scoreCircumference() { return 2 * Math.PI * 54; }

  get scoreOffset() {
    if (!this.score) return this.scoreCircumference;
    return this.scoreCircumference * (1 - this.score.overallScore / 100);
  }

  constructor(
    private scoringService: AIScoringService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    const studentId = user?.id || '1';

    this.scoringService.getLatestScore(studentId).subscribe({
      next: data => { this.score = data; this.loading = false; },
      error: () => { this.loading = false; }
    });

    this.scoringService.getStudentStats(studentId).subscribe(s => this.stats = s);
    this.scoringService.getScoreEvolution(studentId).subscribe(d => this.evolutionData = d);
    this.scoringService.getLeaderboard(5).subscribe(d => this.leaderboard = d);
  }

  loadAiFeedback() {
    if (!this.score?.idEval || this.aiFeedback) return;
    this.scoringService.getAiFeedback(this.score.idEval).subscribe(d => this.aiFeedback = d);
  }

  loadLearningPath() {
    if (!this.score?.idEval || this.learningPath) return;
    this.scoringService.getLearningPath(this.score.idEval).subscribe(d => this.learningPath = d);
    this.showLearningPath = true;
  }

  loadInterviewQuestions() {
    if (!this.score?.idEval || this.interviewQuestions.length) return;
    this.scoringService.getInterviewQuestions(this.score.idEval).subscribe(d => this.interviewQuestions = d);
    this.showInterviewQ = true;
  }

  getScoreColor(value: number): string {
    if (value >= 85) return '#6366F1';
    if (value >= 70) return '#F59E0B';
    if (value >= 50) return '#10B981';
    return '#EF4444';
  }

  getScoreLabel(value: number): string {
    if (value >= 85) return 'Excellent';
    if (value >= 70) return 'Good';
    if (value >= 50) return 'Average';
    return 'Needs Work';
  }

  getRankEmoji(rank: string): string {
    return { BRONZE:'🥉', SILVER:'🥈', GOLD:'🥇', PLATINUM:'💎' }[rank] ?? '';
  }

  getRankColor(rank: string): string {
    return { BRONZE:'#CD7F32', SILVER:'#9CA3AF', GOLD:'#F59E0B', PLATINUM:'#6366F1' }[rank] ?? '#9CA3AF';
  }
}*/

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AIScoringService } from '../../../core/services/ai-scoring.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { StudentProfileService } from '../../../core/services/student-profile.service';
import { AuthService } from '../../../core/services/auth.service';
import { AIScore } from '../../../core/models/score.model';
import { StudentProfile, TechnicalSkill, SoftSkill, Education, WorkExperience } from '../../../core/models/student-profile.model';
import { Evaluation } from '../../../core/models/evaluation.model';

@Component({
  selector: 'b2u-scoring-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './scoring-dashboard.html',
  styleUrls: ['./scoring-dashboard.scss']
})
export class ScoringDashboardComponent implements OnInit {

  // ── Score section ──
  score: AIScore | null = null;
  stats: any = null;
  scoreLoading = true;
techInput = '';
  // ── Profile CRUD ──
  profile: StudentProfile = {
    userId: '',
    education: [],
    workExperience: [],
    technicalSkills: [],
    softSkills: []
  };
  profileLoading = false;
  profileSaved = false;
  activeProfileTab: 'technical' | 'soft' | 'education' | 'experience' = 'technical';

  // ── Forms for adding items ──
  newTechSkill: TechnicalSkill = this.emptyTechSkill();
  newSoftSkill: SoftSkill = this.emptySoftSkill();
  newEducation: Education = this.emptyEducation();
  newExperience: WorkExperience = this.emptyExperience();

  // ── Evaluation result ──
  evaluation: Evaluation | null = null;
  evalLoading = false;
  evalError = '';

  // ── Tabs ──
  activeTab: 'overview' | 'details' | 'evolution' | 'leaderboard' | 'ai' = 'overview';

  // ── Evolution ──
  evolutionData: AIScore[] = [];
  leaderboard: any[] = [];

  // Skill levels
  techLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  techCategories = ['frontend', 'backend', 'devops', 'mobile', 'data', 'other'];
  expTypes = ['stage', 'freelance', 'cdi', 'cdd', 'projet'];
  degrees = ['Licence', 'Master', 'Ingénieur', 'Doctorat', 'BTS', 'DUT', 'Autre'];

  constructor(
    private scoringService: AIScoringService,
    private evalService: EvaluationService,
    private profileService: StudentProfileService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.getCurrentUser();
    const userId = user?.id || user?.email || '1';

    // Load score
    this.scoringService.getLatestScore(userId).subscribe({
      next: s => { this.score = s; this.scoreLoading = false; },
      error: () => this.scoreLoading = false
    });

    this.scoringService.getStudentStats(userId).subscribe(s => this.stats = s);
    this.scoringService.getScoreEvolution(userId).subscribe(d => this.evolutionData = d);
    this.scoringService.getLeaderboard(5).subscribe(d => this.leaderboard = d);

    // Load profile
    this.profileService.getByUserId(userId).subscribe(p => {
      this.profile = {
        ...p,
        userId,
        education: p?.education ?? [],
        workExperience: p?.workExperience ?? [],
        technicalSkills: p?.technicalSkills ?? [],
        softSkills: p?.softSkills ?? []
      };
    });
  }

  // ────────────────────────────────────────
  // TECH SKILLS CRUD
  // ────────────────────────────────────────
  addTechSkill() {
    if (!this.newTechSkill.name.trim()) return;
    this.profile.technicalSkills = [...(this.profile.technicalSkills || []),
      { ...this.newTechSkill, id: Date.now().toString() }];
    this.newTechSkill = this.emptyTechSkill();
  }
  addExperienceWithTech() {
  this.newExperience.technologies = this.techInput
    .split(',').map(t => t.trim()).filter(t => t.length > 0);
  this.addExperience();
  this.techInput = '';
}
  removeTechSkill(id: string) {
    this.profile.technicalSkills = this.profile.technicalSkills.filter(s => s.id !== id);
  }

  // ────────────────────────────────────────
  // SOFT SKILLS CRUD
  // ────────────────────────────────────────
  addSoftSkill() {
    if (!this.newSoftSkill.name.trim()) return;
    this.profile.softSkills = [...(this.profile.softSkills || []),
      { ...this.newSoftSkill, id: Date.now().toString() }];
    this.newSoftSkill = this.emptySoftSkill();
  }

  removeSoftSkill(id: string) {
    this.profile.softSkills = this.profile.softSkills.filter(s => s.id !== id);
  }

  // ────────────────────────────────────────
  // EDUCATION CRUD
  // ────────────────────────────────────────
  addEducation() {
    if (!this.newEducation.institution.trim()) return;
    this.profile.education = [...(this.profile.education || []),
      { ...this.newEducation, id: Date.now().toString() }];
    this.newEducation = this.emptyEducation();
  }

  removeEducation(id: string) {
    this.profile.education = this.profile.education.filter(e => e.id !== id);
  }

  // ────────────────────────────────────────
  // EXPERIENCE CRUD
  // ────────────────────────────────────────
  addExperience() {
    if (!this.newExperience.title.trim()) return;
    this.profile.workExperience = [...(this.profile.workExperience || []),
      { ...this.newExperience, id: Date.now().toString() }];
    this.newExperience = this.emptyExperience();
  }

  removeExperience(id: string) {
    this.profile.workExperience = this.profile.workExperience.filter(e => e.id !== id);
  }

  // ────────────────────────────────────────
  // SAVE PROFILE + GENERATE EVALUATION
  // ────────────────────────────────────────
  saveAndEvaluate() {
    const user = this.auth.getCurrentUser();
    const userId = user?.id || user?.email || '1';
    this.profile.userId = userId;
    this.profileLoading = true;
    this.profileSaved = false;
    this.evalError = '';

    this.profileService.save(this.profile).subscribe({
      next: savedProfile => {
        this.profile = savedProfile || this.profile;
        this.profile.userId = userId;
        this.profileLoading = false;
        this.profileSaved = true;
        this.generateEvaluation();
        setTimeout(() => this.profileSaved = false, 3000);
      },
      error: () => {
        this.profileLoading = false;
        // Still generate evaluation with current data
        this.generateEvaluation();
      }
    });
  }

  private generateEvaluation() {
    const user = this.auth.getCurrentUser();
    this.evalLoading = true;
    this.evalError = '';

    // Compute scores from profile data
    const scores = this.computeScoresFromProfile();

    const evalDTO: Evaluation = {
      idEtudiant:   user?.id || user?.email || '1',
      nomEtudiant:  `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Student',
      idProjet:     'profile-eval',
      nomProjet:    'Profile Auto-Evaluation',
      type:         'PROFILE',
      ...scores
    };

    // Update the local UI immediately so the score card reflects the current profile
    this.evaluation = { ...evalDTO, ...scores, createdAt: new Date().toISOString() };
    this.score = this.evaluationToAIScore(this.evaluation);

    this.evalService.create(evalDTO).subscribe({
      next: result => {
        this.evaluation = result;
        this.evalLoading = false;
        this.score = this.evaluationToAIScore(result);
      },
      error: () => {
        this.evalLoading = false;
        this.evalError = 'Could not save evaluation. Showing local result.';
        // Keep the locally computed result when backend fails
        this.evaluation = { ...evalDTO, ...scores };
        this.score = this.evaluationToAIScore(this.evaluation);
      }
    });
  }

  // ─── Score computation from profile ───
  private computeScoresFromProfile(): Pick<
  Evaluation,
  | 'technicalSkills'
  | 'communication'
  | 'projectExperience'
  | 'problemSolving'
  | 'teamwork'
  | 'punctuality'
  | 'creativity'
>{
    const tech   = this.profile.technicalSkills || [];
    const soft   = this.profile.softSkills || [];
    const edu    = this.profile.education || [];
    const exp    = this.profile.workExperience || [];

    // Technical skills → technicalSkills score
    const techScore = tech.length === 0 ? 30 : Math.min(100,
      tech.reduce((sum, s) => sum + this.levelToScore(s.level), 0) / tech.length
      + Math.min(20, tech.length * 4) // bonus for more skills
    );

    // Soft skills → communication + teamwork
    const softScore = soft.length === 0 ? 40 : Math.min(100,
      soft.reduce((sum, s) => sum + (s.level / 5) * 100, 0) / soft.length
    );

    // Experience → projectExperience + problemSolving
    const totalExpMonths = exp.reduce((sum, e) => {
      if (e.current) return sum + 12;
      if (!e.startDate || !e.endDate) return sum + 6;
      const start = new Date(e.startDate + '-01');
      const end   = new Date(e.endDate   + '-01');
      return sum + Math.max(0,
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth()    - start.getMonth())
      );
    }, 0);
    const expScore = Math.min(100, 30 + totalExpMonths * 2);

    // Education → general boost
    const eduBonus = edu.length === 0 ? 0 : Math.min(15,
      edu.reduce((sum, e) => sum + this.degreeScore(e.degree), 0)
    );

    // Compute final dimensions
    const technicalSkills   = Math.round(Math.min(100, techScore + eduBonus * 0.5));
    const communication     = Math.round(Math.min(100, softScore * 0.7 + 25));
    const projectExperience = Math.round(Math.min(100, expScore));
    const problemSolving    = Math.round(Math.min(100, techScore * 0.6 + expScore * 0.4));
    const teamwork          = Math.round(Math.min(100, softScore * 0.8 + 15));
    const punctuality       = Math.round(Math.min(100, 55 + eduBonus + (exp.length > 0 ? 10 : 0)));
    const creativity        = Math.round(Math.min(100, techScore * 0.4 + softScore * 0.3 + 25));

    return { technicalSkills, communication, projectExperience, problemSolving, teamwork, punctuality, creativity };
  }

  private levelToScore(level: string): number {
    return { beginner: 40, intermediate: 65, advanced: 82, expert: 95 }[level] ?? 50;
  }

  private degreeScore(degree: string): number {
    return { Doctorat: 15, Ingénieur: 12, Master: 12, Licence: 8, BTS: 5, DUT: 5, Autre: 3 }[degree] ?? 3;
  }

  private evaluationToAIScore(e: any): AIScore {
  // Compute weighted overall score locally
  const overallScore = e.overallScore ?? (
    e.technicalSkills   * 0.25 +
    e.communication     * 0.15 +
    e.projectExperience * 0.20 +
    e.problemSolving    * 0.15 +
    e.teamwork          * 0.10 +
    e.punctuality       * 0.10 +
    e.creativity        * 0.05
  );

  const rounded = Math.round(overallScore * 10) / 10;

  const rank = rounded >= 85 ? 'PLATINUM'
    : rounded >= 70 ? 'GOLD'
    : rounded >= 50 ? 'SILVER' : 'BRONZE';

  return {
    idEval:         e.idEval ?? 'local',
    nomEtudiant:    e.nomEtudiant ?? '',
    overallScore:   rounded,
    rank:           (e.rank ?? rank) as any,
    technicalSkills:   e.technicalSkills,
    communication:     e.communication,
    projectExperience: e.projectExperience,
    problemSolving:    e.problemSolving,
    teamwork:          e.teamwork,
    punctuality:       e.punctuality,
    creativity:        e.creativity,
    skillScores: [
      { category: 'Technical Skills',   score: e.technicalSkills,   weight: 0.25 },
      { category: 'Communication',      score: e.communication,      weight: 0.15 },
      { category: 'Project Experience', score: e.projectExperience,  weight: 0.20 },
      { category: 'Problem Solving',    score: e.problemSolving,     weight: 0.15 },
      { category: 'Teamwork',           score: e.teamwork,           weight: 0.10 },
      { category: 'Punctuality',        score: e.punctuality,        weight: 0.10 },
      { category: 'Creativity',         score: e.creativity,         weight: 0.05 },
    ],
    strengths:       e.strengths       ?? this.computeLocalStrengths(e),
    improvements:    e.improvements    ?? this.computeLocalImprovements(e),
    recommendations: e.recommendations ?? this.computeLocalRecommendations(e),
    status:          e.status          ?? 'SUBMITTED'
  };
}

private computeLocalStrengths(e: any): string[] {
  const s: string[] = [];
  if (e.technicalSkills   >= 75) s.push('Strong technical foundation');
  if (e.communication     >= 75) s.push('Excellent communication skills');
  if (e.projectExperience >= 75) s.push('Solid project experience');
  if (e.problemSolving    >= 75) s.push('Sharp analytical skills');
  if (e.teamwork          >= 75) s.push('Collaborative team player');
  if (e.punctuality       >= 75) s.push('Reliable and deadline-driven');
  if (e.creativity        >= 75) s.push('Creative and innovative thinker');
  return s.length ? s : ['Keep building your profile for detailed insights'];
}

private computeLocalImprovements(e: any): string[] {
  const scores: [string, number][] = [
    ['Technical Skills', e.technicalSkills],
    ['Communication', e.communication],
    ['Project Experience', e.projectExperience],
    ['Problem Solving', e.problemSolving],
    ['Teamwork', e.teamwork],
    ['Punctuality', e.punctuality],
    ['Creativity', e.creativity],
  ];
  return scores.sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([name, val]) => `${name} (${val}/100)`);
}

private computeLocalRecommendations(e: any): string[] {
  const r: string[] = [];
  if (e.technicalSkills   < 70) r.push('Add more technical skills to boost your technical score');
  if (e.projectExperience < 70) r.push('Add work experience or projects to improve experience score');
  if (e.communication     < 70) r.push('Add soft skills like Communication and Leadership');
  if (e.teamwork          < 70) r.push('Demonstrate teamwork through group projects or open source');
  if (r.length === 0) r.push('Excellent profile! Keep your skills updated regularly.');
  return r;
}

  // ────────────────────────────────────────
  // DISPLAY HELPERS
  // ────────────────────────────────────────
  get rankConfig() {
    const configs: Record<string, any> = {
      BRONZE:   { label: 'Bronze',   emoji: '🥉', color: '#CD7F32', bg: '#FDF3E7' },
      SILVER:   { label: 'Silver',   emoji: '🥈', color: '#9CA3AF', bg: '#F3F4F6' },
      GOLD:     { label: 'Gold',     emoji: '🥇', color: '#F59E0B', bg: '#FFFBEB' },
      PLATINUM: { label: 'Platinum', emoji: '💎', color: '#6366F1', bg: '#EEF2FF' },
    };
    return configs[this.score?.rank ?? 'BRONZE'] ?? configs['BRONZE'];
  }

  get scoreCircumference() { return 2 * Math.PI * 54; }
  get scoreOffset() {
    return this.scoreCircumference * (1 - (this.score?.overallScore ?? 0) / 100);
  }

  getScoreColor(v: number): string {
    if (v >= 85) return '#6366F1';
    if (v >= 70) return '#F59E0B';
    if (v >= 50) return '#10B981';
    return '#EF4444';
  }

  getScoreLabel(v: number): string {
    if (v >= 85) return 'Excellent';
    if (v >= 70) return 'Good';
    if (v >= 50) return 'Average';
    return 'Needs Work';
  }

  getRankEmoji(rank: string): string {
    return { BRONZE:'🥉', SILVER:'🥈', GOLD:'🥇', PLATINUM:'💎' }[rank] ?? '';
  }

  getRankColor(rank: string): string {
    return { BRONZE:'#CD7F32', SILVER:'#9CA3AF', GOLD:'#F59E0B', PLATINUM:'#6366F1' }[rank] ?? '#9CA3AF';
  }

  levelLabel(level: string): string {
    return { beginner: 'Débutant', intermediate: 'Intermédiaire', advanced: 'Avancé', expert: 'Expert' }[level] ?? level;
  }

  levelWidth(level: string): number {
    return { beginner: 25, intermediate: 50, advanced: 75, expert: 100 }[level] ?? 50;
  }

  levelColor(level: string): string {
    return { beginner: '#EF4444', intermediate: '#F59E0B', advanced: '#10B981', expert: '#6366F1' }[level] ?? '#94A3B8';
  }

  starArray(n: number): number[] { return Array(n).fill(0); }

  get totalExperienceMonths(): number {
    return (this.profile.workExperience || []).reduce((sum, e) => {
      if (e.current) return sum + 12;
      if (!e.startDate || !e.endDate) return sum + 6;
      const s = new Date(e.startDate + '-01');
      const en = new Date(e.endDate + '-01');
      return sum + Math.max(0,
        (en.getFullYear() - s.getFullYear()) * 12 + (en.getMonth() - s.getMonth()));
    }, 0);
  }

  // Empty factories
  private emptyTechSkill(): TechnicalSkill {
    return { name: '', level: 'intermediate', category: 'frontend', yearsOfExperience: 1 };
  }
  private emptySoftSkill(): SoftSkill { return { name: '', level: 3 }; }
  private emptyEducation(): Education {
    return { degree: 'Licence', field: '', institution: '', startYear: 2021, current: false };
  }
  private emptyExperience(): WorkExperience {
    return { title: '', company: '', type: 'stage', startDate: '', current: false, technologies: [] };
  }
}