import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { ProjetService } from '../../../core/services/projet';
import { WorkPostService } from '../../../core/services/workpost.service';
import { Candidature } from '../../../core/models/candidature.model';
import { Project } from '../../../core/models/project.model';
import { WorkPost } from '../../../core/models/workPost.model';

interface KpiCard {
  label: string;
  value: number | string;
  icon: string;
  tone: string;
  hint: string;
}

interface ChartItem {
  label: string;
  value: number;
  percent: number;
  color: string;
}

@Component({
  selector: 'b2u-company-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="company-dashboard">
      <section class="hero">
        <div>
          <span class="eyebrow">Espace entreprise</span>
          <h1>Dashboard company</h1>
          <p>Suivi des candidatures, projets et offres en un seul endroit.</p>
        </div>
        <div class="hero-actions">
          <a routerLink="/company/candidatures" class="btn-primary">
            <mat-icon>people</mat-icon>
            Candidatures
          </a>
          <a routerLink="/company/work-post" class="btn-secondary">
            <mat-icon>work</mat-icon>
            Offres
          </a>
        </div>
        <div class="shape shape-a"></div>
        <div class="shape shape-b"></div>
      </section>

      <div class="loading-card" *ngIf="loading">
        <mat-icon>sync</mat-icon>
        <span>Chargement des statistiques...</span>
      </div>

      <ng-container *ngIf="!loading">
        <section class="kpi-grid">
          <article class="kpi-card" *ngFor="let item of kpis" [ngClass]="item.tone">
            <div class="kpi-icon"><mat-icon>{{ item.icon }}</mat-icon></div>
            <div>
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <small>{{ item.hint }}</small>
            </div>
          </article>
        </section>

        <section class="charts-grid">
          <article class="panel status-panel">
            <div class="panel-header">
              <div>
                <h2>Statut des candidatures</h2>
                <p>Repartition par decision.</p>
              </div>
              <a routerLink="/company/candidatures">Voir tout</a>
            </div>

            <div class="donut-wrap">
              <div class="donut" [style.background]="donutStyle">
                <div
                  class="donut-chip"
                  *ngFor="let item of statusChart; let i = index"
                  [ngClass]="'chip-' + i"
                  [style.borderColor]="item.color">
                  {{ item.value }}
                </div>
                <div class="donut-center">
                  <strong>{{ candidatures.length }}</strong>
                  <span>candidatures</span>
                </div>
              </div>
              <div class="legend">
                <div class="legend-row" *ngFor="let item of statusChart">
                  <span class="dot" [style.background]="item.color"></span>
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }} cand.</strong>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Types de projets</h2>
                <p>Stage, projet et hackathon.</p>
              </div>
              <a routerLink="/company/projects">Gerer</a>
            </div>

            <div class="bar-chart">
              <div class="bar-row" *ngFor="let item of projectTypeChart">
                <div class="bar-label">
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
                <div class="bar-track">
                  <div class="bar-fill" [style.width.%]="item.percent" [style.background]="item.color">
                    <span>{{ item.value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Modes de travail</h2>
                <p>Organisation des offres publiees.</p>
              </div>
              <a routerLink="/company/work-post">Offres</a>
            </div>

            <div class="mode-grid">
              <div class="mode-card" *ngFor="let item of workModeChart">
                <div class="mode-shape" [style.borderColor]="item.color">
                  <span [style.background]="item.color"></span>
                </div>
                <strong>{{ item.value }}</strong>
                <small>{{ item.label }}</small>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Matching moyen</h2>
                <p>Qualite globale des candidatures.</p>
              </div>
            </div>

            <div class="score-visual">
              <svg viewBox="0 0 220 120" preserveAspectRatio="none">
                <path d="M0,92 C48,42 82,112 126,58 C157,20 184,44 220,18" />
                <circle [attr.cx]="scorePointX" [attr.cy]="scorePointY" r="6" />
              </svg>
              <div class="score-value">
                <strong>{{ averageScore }}%</strong>
                <span>{{ scoreLabel }}</span>
              </div>
            </div>
          </article>
        </section>

        <section class="bottom-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Dernieres candidatures</h2>
                <p>Les plus recentes dans votre espace.</p>
              </div>
            </div>

            <div class="candidate-list" *ngIf="recentCandidatures.length; else emptyCandidatures">
              <div class="candidate-row" *ngFor="let c of recentCandidatures">
                <div class="avatar">{{ initials(c) }}</div>
                <div>
                  <strong>{{ c.prenomCandidat }} {{ c.nomCandidat }}</strong>
                  <span>{{ c.projectTitle || c.projectId || 'Projet non defini' }}</span>
                </div>
                <span class="status-pill" [ngClass]="statusClass(c.statutCandidature)">
                  {{ displayStatus(c.statutCandidature) }}
                </span>
              </div>
            </div>

            <ng-template #emptyCandidatures>
              <div class="empty-state">Aucune candidature pour le moment.</div>
            </ng-template>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h2>Actions rapides</h2>
                <p>Acceder aux operations importantes.</p>
              </div>
            </div>

            <div class="quick-actions">
              <a routerLink="/company/work-post" class="action-card">
                <mat-icon>add_circle</mat-icon>
                <span>Ajouter ou gerer une offre</span>
              </a>
              <a routerLink="/company/projects/new" class="action-card">
                <mat-icon>folder_open</mat-icon>
                <span>Creer un projet</span>
              </a>
              <a routerLink="/company/candidatures" class="action-card">
                <mat-icon>rule</mat-icon>
                <span>Traiter les candidatures</span>
              </a>
            </div>
          </article>
        </section>
      </ng-container>
    </div>
  `,
  styles: [`
    .company-dashboard { display:grid; gap:1.25rem; }
    .hero { position:relative; overflow:hidden; display:flex; justify-content:space-between; gap:1rem; padding:1.5rem; border-radius:14px; color:white; background:linear-gradient(135deg,#065f46,#1d4ed8); box-shadow:0 18px 40px rgba(15,23,42,.16); }
    .hero h1 { margin:.2rem 0 .35rem; font-size:1.85rem; }
    .hero p { margin:0; color:#dbeafe; }
    .eyebrow { font-size:.78rem; font-weight:900; letter-spacing:.08em; text-transform:uppercase; color:#bbf7d0; }
    .hero-actions { display:flex; align-items:center; gap:.65rem; flex-wrap:wrap; z-index:1; }
    .btn-primary,.btn-secondary { display:inline-flex; align-items:center; gap:.45rem; border-radius:9px; padding:.72rem 1rem; font-weight:850; text-decoration:none; }
    .btn-primary { color:#0f172a; background:white; }
    .btn-secondary { color:white; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); }
    .shape { position:absolute; border:1px solid rgba(255,255,255,.22); }
    .shape-a { width:150px; height:150px; border-radius:28px; right:12%; top:-54px; transform:rotate(28deg); }
    .shape-b { width:90px; height:90px; border-radius:50%; right:-18px; bottom:-20px; background:rgba(255,255,255,.12); }
    .loading-card,.panel,.kpi-card { background:white; border:1px solid #e2e8f0; box-shadow:0 1px 3px rgba(15,23,42,.06); }
    .loading-card { display:flex; align-items:center; gap:.65rem; padding:1rem; border-radius:12px; color:#475569; font-weight:750; }
    .loading-card mat-icon { animation:spin 1s linear infinite; color:#2563eb; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .kpi-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1rem; }
    .kpi-card { display:flex; gap:.8rem; align-items:center; padding:1rem; border-radius:12px; }
    .kpi-card span { display:block; color:#64748b; font-size:.8rem; font-weight:850; }
    .kpi-card strong { display:block; margin:.15rem 0; color:#0f172a; font-size:1.65rem; }
    .kpi-card small { color:#64748b; font-weight:650; }
    .kpi-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; }
    .blue .kpi-icon { color:#1d4ed8; background:#dbeafe; }
    .green .kpi-icon { color:#047857; background:#d1fae5; }
    .amber .kpi-icon { color:#b45309; background:#fef3c7; }
    .violet .kpi-icon { color:#7c3aed; background:#ede9fe; }
    .charts-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; }
    .bottom-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:1rem; }
    .panel { border-radius:12px; padding:1.15rem; min-width:0; }
    .panel-header { display:flex; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
    .panel-header h2 { margin:0; font-size:1.05rem; color:#0f172a; }
    .panel-header p { margin:.2rem 0 0; color:#64748b; font-size:.86rem; }
    .panel-header a { color:#2563eb; font-weight:850; text-decoration:none; font-size:.86rem; }
    .donut-wrap { display:flex; align-items:center; gap:1.25rem; }
    .donut { position:relative; width:176px; height:176px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .donut-center { width:96px; height:96px; border-radius:50%; background:white; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:inset 0 0 0 1px #e2e8f0; }
    .donut-center strong { font-size:1.65rem; color:#0f172a; }
    .donut-center span { color:#64748b; font-size:.78rem; font-weight:800; }
    .donut-chip { position:absolute; min-width:30px; height:30px; padding:0 .35rem; border-radius:999px; border:2px solid; background:white; color:#0f172a; display:flex; align-items:center; justify-content:center; font-size:.78rem; font-weight:950; box-shadow:0 8px 18px rgba(15,23,42,.16); }
    .donut-chip.chip-0 { top:4px; left:50%; transform:translateX(-50%); }
    .donut-chip.chip-1 { right:0; top:50%; transform:translateY(-50%); }
    .donut-chip.chip-2 { bottom:4px; left:50%; transform:translateX(-50%); }
    .donut-chip.chip-3 { left:0; top:50%; transform:translateY(-50%); }
    .legend { display:grid; gap:.6rem; flex:1; }
    .legend-row { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.5rem; color:#334155; font-weight:750; }
    .dot { width:10px; height:10px; border-radius:50%; }
    .bar-chart { display:grid; gap:.85rem; }
    .bar-label { display:flex; justify-content:space-between; margin-bottom:.35rem; color:#334155; font-weight:800; }
    .bar-track { height:22px; background:#f1f5f9; border-radius:999px; overflow:hidden; }
    .bar-fill { height:100%; min-width:34px; border-radius:999px; display:flex; align-items:center; justify-content:flex-end; padding-right:.55rem; color:white; font-size:.76rem; font-weight:950; transition:width .25s; }
    .mode-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:.8rem; }
    .mode-card { padding:1rem; border:1px solid #e2e8f0; border-radius:12px; background:#f8fafc; text-align:center; }
    .mode-card strong { display:block; color:#0f172a; font-size:1.45rem; margin:.4rem 0 .1rem; }
    .mode-card small { color:#64748b; font-weight:850; }
    .mode-shape { width:46px; height:46px; margin:0 auto; border:2px solid; border-radius:14px; transform:rotate(45deg); display:flex; align-items:center; justify-content:center; }
    .mode-shape span { width:18px; height:18px; border-radius:50%; display:block; }
    .score-visual { position:relative; min-height:180px; display:flex; align-items:center; justify-content:center; }
    .score-visual svg { position:absolute; inset:18px 0 0; width:100%; height:120px; }
    .score-visual path { fill:none; stroke:#2563eb; stroke-width:5; stroke-linecap:round; }
    .score-visual circle { fill:#047857; stroke:white; stroke-width:3; }
    .score-value { position:relative; text-align:center; background:white; border:1px solid #dbeafe; border-radius:999px; width:112px; height:112px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 12px 26px rgba(37,99,235,.14); }
    .score-value strong { font-size:1.8rem; color:#0f172a; }
    .score-value span { color:#64748b; font-weight:850; font-size:.78rem; }
    .candidate-list { display:grid; gap:.65rem; }
    .candidate-row { display:grid; grid-template-columns:auto 1fr auto; gap:.7rem; align-items:center; padding:.75rem; border-radius:10px; background:#f8fafc; border:1px solid #eef2f7; }
    .avatar { width:38px; height:38px; border-radius:10px; background:#dbeafe; color:#1d4ed8; font-weight:900; display:flex; align-items:center; justify-content:center; }
    .candidate-row strong,.candidate-row span { display:block; }
    .candidate-row span { color:#64748b; font-size:.82rem; }
    .status-pill { border-radius:999px; padding:.25rem .6rem; font-size:.72rem; font-weight:900; white-space:nowrap; }
    .status-pill.accepted { color:#065f46; background:#d1fae5; }
    .status-pill.rejected { color:#991b1b; background:#fee2e2; }
    .status-pill.pending { color:#92400e; background:#fef3c7; }
    .status-pill.review { color:#1e40af; background:#dbeafe; }
    .quick-actions { display:grid; gap:.75rem; }
    .action-card { display:flex; align-items:center; gap:.65rem; padding:.85rem; border-radius:10px; background:#f8fafc; border:1px solid #e2e8f0; color:#0f172a; text-decoration:none; font-weight:850; }
    .action-card mat-icon { color:#2563eb; }
    .empty-state { padding:1.2rem; border-radius:10px; background:#f8fafc; color:#64748b; font-weight:750; text-align:center; }
    @media (max-width:1100px) { .kpi-grid,.charts-grid,.bottom-grid { grid-template-columns:1fr 1fr; } .bottom-grid { grid-template-columns:1fr; } }
    @media (max-width:760px) { .hero,.panel-header,.donut-wrap { flex-direction:column; align-items:flex-start; } .kpi-grid,.charts-grid,.mode-grid { grid-template-columns:1fr; } }
  `]
})
export class CompanyDashboardComponent implements OnInit {
  loading = true;
  candidatures: Candidature[] = [];
  projects: Project[] = [];
  workPosts: WorkPost[] = [];
  kpis: KpiCard[] = [];
  statusChart: ChartItem[] = [];
  projectTypeChart: ChartItem[] = [];
  workModeChart: ChartItem[] = [];
  recentCandidatures: Candidature[] = [];
  donutStyle = '#e2e8f0';
  averageScore = 0;
  scoreLabel = 'N/A';
  scorePointX = 0;
  scorePointY = 92;

  constructor(
    private auth: AuthService,
    private candidatureService: CandidatureService,
    private projetService: ProjetService,
    private workPostService: WorkPostService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const user = this.auth.getCurrentUser();
    const companyKeys = [user?.id, user?.email, user?.companyName].filter(Boolean) as string[];
    const candidatureRequests = companyKeys.length
      ? companyKeys.map(key => this.candidatureService.getByCompany(key).pipe(catchError(() => of([] as Candidature[]))))
      : [of([] as Candidature[])];

    forkJoin({
      candidatureGroups: forkJoin(candidatureRequests),
      projects: this.projetService.getAllProjets().pipe(catchError(() => of([] as Project[]))),
      workPosts: user?.email
        ? this.workPostService.getByEntreprise(user.email).pipe(catchError(() => of([] as WorkPost[])))
        : of([] as WorkPost[])
    }).pipe(
      map(({ candidatureGroups, projects, workPosts }) => {
        const candidatures = this.uniqueCandidatures(candidatureGroups.flat());
        return {
          candidatures,
          projects: this.filterCompanyProjects(projects, user),
          workPosts
        };
      })
    ).subscribe(({ candidatures, projects, workPosts }) => {
      this.candidatures = candidatures;
      this.projects = projects;
      this.workPosts = workPosts;
      this.buildStats();
      this.loading = false;
    });
  }

  private buildStats(): void {
    const accepted = this.countByStatus('ACCEPTEE');
    const refused = this.countByStatus('REFUSEE');
    const pending = this.countByStatus('EN_COURS');
    const review = this.countByStatus('EN_REVUE');
    const activeOffers = this.workPosts.filter(post => (post.status || 'ACTIVE') === 'ACTIVE').length;
    const openProjects = this.projects.filter(project => project.status === 'open').length;

    this.averageScore = this.candidatures.length
      ? Math.round(this.candidatures.reduce((sum, item) => sum + (item.scoreMatching ?? 0), 0) / this.candidatures.length)
      : 0;
    this.scoreLabel = this.averageScore >= 75 ? 'Excellent' : this.averageScore >= 55 ? 'Bon' : this.averageScore > 0 ? 'A ameliorer' : 'N/A';
    this.scorePointX = Math.min(220, Math.max(0, Math.round(this.averageScore * 2.2)));
    this.scorePointY = Math.max(18, 92 - Math.round(this.averageScore * .74));

    this.kpis = [
      { label: 'Candidatures', value: this.candidatures.length, icon: 'people', tone: 'blue', hint: 'Total recu' },
      { label: 'Acceptees', value: accepted, icon: 'check_circle', tone: 'green', hint: 'Profils retenus' },
      { label: 'Offres actives', value: activeOffers, icon: 'work', tone: 'amber', hint: 'Work posts ouverts' },
      { label: 'Score moyen', value: `${this.averageScore}%`, icon: 'analytics', tone: 'violet', hint: 'Matching global' }
    ];

    this.statusChart = this.toChartItems([
      ['Acceptees', accepted, '#10b981'],
      ['En revue', review, '#3b82f6'],
      ['En cours', pending, '#f59e0b'],
      ['Refusees', refused, '#ef4444']
    ]);
    this.donutStyle = this.buildDonutStyle(this.statusChart);

    this.projectTypeChart = this.toChartItems([
      ['Stage', this.projects.filter(p => (p.type || '').toUpperCase() === 'STAGE').length, '#2563eb'],
      ['Projet', this.projects.filter(p => (p.type || 'PROJET').toUpperCase() === 'PROJET').length, '#059669'],
      ['Hackathon', this.projects.filter(p => (p.type || '').toUpperCase() === 'HACKATHON').length, '#7c3aed'],
      ['Ouverts', openProjects, '#f59e0b']
    ]);

    this.workModeChart = this.toChartItems([
      ['Remote', this.workPosts.filter(p => p.workMode === 'REMOTE').length, '#2563eb'],
      ['Hybrid', this.workPosts.filter(p => p.workMode === 'HYBRID').length, '#059669'],
      ['Onsite', this.workPosts.filter(p => p.workMode === 'ONSITE').length, '#f59e0b']
    ]);

    this.recentCandidatures = [...this.candidatures]
      .sort((a, b) => this.time(b.dateCandidature) - this.time(a.dateCandidature))
      .slice(0, 5);
  }

  private toChartItems(items: [string, number, string][]): ChartItem[] {
    const max = Math.max(1, ...items.map(([, value]) => value));
    const total = Math.max(1, items.reduce((sum, [, value]) => sum + value, 0));
    return items.map(([label, value, color]) => ({
      label,
      value,
      color,
      percent: Math.round((value / (items.length > 3 ? total : max)) * 100)
    }));
  }

  private buildDonutStyle(items: ChartItem[]): string {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (!total) return 'conic-gradient(#e2e8f0 0 100%)';
    let cursor = 0;
    const parts = items.map(item => {
      const start = cursor;
      const end = cursor + (item.value / total) * 100;
      cursor = end;
      return `${item.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  private countByStatus(status: string): number {
    return this.candidatures.filter(item => this.normalizeStatus(item.statutCandidature) === status).length;
  }

  displayStatus(status?: string): string {
    const normalized = this.normalizeStatus(status);
    const labels: Record<string, string> = {
      ACCEPTEE: 'Acceptee',
      REFUSEE: 'Refusee',
      EN_REVUE: 'En revue',
      EN_COURS: 'En cours'
    };
    return labels[normalized] || status || 'Inconnu';
  }

  statusClass(status?: string): string {
    const normalized = this.normalizeStatus(status);
    if (normalized === 'ACCEPTEE') return 'accepted';
    if (normalized === 'REFUSEE') return 'rejected';
    if (normalized === 'EN_REVUE') return 'review';
    return 'pending';
  }

  initials(candidature: Candidature): string {
    return `${candidature.prenomCandidat?.charAt(0) || ''}${candidature.nomCandidat?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  private normalizeStatus(status?: string): string {
    return (status || '')
      .trim()
      .toUpperCase()
      .replace('É', 'E')
      .replace('È', 'E')
      .replace('Ê', 'E')
      .replace(' ', '_');
  }

  private uniqueCandidatures(items: Candidature[]): Candidature[] {
    const map = new Map<string, Candidature>();
    items.forEach(item => map.set(item.idCandidature || `${item.email}-${item.projectId}`, item));
    return Array.from(map.values());
  }

  private filterCompanyProjects(projects: Project[], user: ReturnType<AuthService['getCurrentUser']>): Project[] {
    const keys = [user?.id, user?.email, user?.companyName].filter(Boolean).map(value => String(value).toLowerCase());
    if (!keys.length) return [];
    return projects.filter(project =>
      keys.includes((project.companyId || '').toLowerCase()) ||
      keys.includes((project.companyName || '').toLowerCase())
    );
  }

  private time(date?: string): number {
    const value = date ? new Date(date).getTime() : 0;
    return Number.isNaN(value) ? 0 : value;
  }
}
