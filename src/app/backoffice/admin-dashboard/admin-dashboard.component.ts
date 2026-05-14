import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidature } from '../../core/models/candidature.model';
import { Project } from '../../core/models/project.model';
import { CandidatureService } from '../../core/services/candidature.service';
import { Entreprise, EntrepriseService } from '../../core/services/entreprise.service';
import { ProjectService } from '../../core/services/project.service';

type AdminStat = {
  label: string;
  value: number | string;
  icon: string;
  tone: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'slate';
};

@Component({
  selector: 'b2u-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  lastUpdate = new Date();
  candidatures: Candidature[] = [];
  projects: Project[] = [];
  companies: Entreprise[] = [];

  stats: AdminStat[] = [];
  recentCandidatures: Candidature[] = [];
  topProjects: Project[] = [];

  constructor(
    private candidatureService: CandidatureService,
    private projectService: ProjectService,
    private entrepriseService: EntrepriseService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    forkJoin({
      candidatures: this.candidatureService.getAll().pipe(catchError(() => of([] as Candidature[]))),
      projects: this.projectService.getProjects().pipe(catchError(() => of([] as Project[]))),
      companies: this.entrepriseService.getAll().pipe(catchError(() => of([] as Entreprise[])))
    }).subscribe(({ candidatures, projects, companies }) => {
      this.candidatures = candidatures || [];
      this.projects = projects || [];
      this.companies = companies || [];
      this.computeDashboard();
      this.loading = false;
      this.lastUpdate = new Date();
    });
  }

  private computeDashboard(): void {
    const total = this.candidatures.length;
    const accepted = this.candidatures.filter(item => this.normalizeStatus(item.statutCandidature) === 'ACCEPTEE').length;
    const refused = this.candidatures.filter(item => this.normalizeStatus(item.statutCandidature) === 'REFUSEE').length;
    const reviewed = this.candidatures.filter(item => this.normalizeStatus(item.statutCandidature) === 'EN_REVUE').length;
    const strongMatches = this.candidatures.filter(item => (item.scoreMatching ?? 0) >= 65).length;
    const averageScore = total
      ? Math.round(this.candidatures.reduce((sum, item) => sum + (item.scoreMatching ?? 0), 0) / total)
      : 0;

    this.stats = [
      { label: 'Candidatures', value: total, icon: 'assignment', tone: 'blue' },
      { label: 'En revue', value: reviewed, icon: 'rate_review', tone: 'amber' },
      { label: 'Acceptées', value: accepted, icon: 'check_circle', tone: 'green' },
      { label: 'Refusées', value: refused, icon: 'cancel', tone: 'red' },
      { label: 'Matchs forts', value: strongMatches, icon: 'verified', tone: 'purple' },
      { label: 'Score moyen', value: `${averageScore}%`, icon: 'insights', tone: 'slate' },
      { label: 'Projets', value: this.projects.length, icon: 'work', tone: 'blue' },
      { label: 'Companies', value: this.companies.length, icon: 'corporate_fare', tone: 'green' }
    ];

    this.recentCandidatures = [...this.candidatures]
      .sort((a, b) => this.getTime(b.dateCandidature) - this.getTime(a.dateCandidature))
      .slice(0, 6);

    this.topProjects = [...this.projects]
      .sort((a, b) => (b.applicantsCount || 0) - (a.applicantsCount || 0))
      .slice(0, 5);
  }

  normalizeStatus(status?: string): string {
    return (status || '')
      .trim()
      .toUpperCase()
      .replace('É', 'E')
      .replace('È', 'E')
      .replace('Ê', 'E')
      .replace('Ã©', 'E')
      .replace('Ã‰', 'E')
      .replace(' ', '_');
  }

  displayStatus(status?: string): string {
    const normalized = this.normalizeStatus(status);
    if (normalized === 'ACCEPTEE') return 'Acceptée';
    if (normalized === 'REFUSEE') return 'Refusée';
    if (normalized === 'EN_REVUE') return 'En revue';
    if (normalized === 'EN_COURS') return 'En cours';
    return status || 'Inconnu';
  }

  getStatusClass(status?: string): string {
    const normalized = this.normalizeStatus(status);
    if (normalized === 'ACCEPTEE') return 'accepted';
    if (normalized === 'REFUSEE') return 'rejected';
    if (normalized === 'EN_REVUE') return 'review';
    return 'pending';
  }

  private getTime(date?: string): number {
    const time = date ? new Date(date).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  }
}
