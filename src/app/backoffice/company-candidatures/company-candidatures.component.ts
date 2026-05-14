import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AutoRefreshService } from '../../core/services/auto-refresh.service';
import { CandidatureService } from '../../core/services/candidature.service';
import { AuthService } from '../../core/services/auth.service';
import { Candidature } from '../../core/models/candidature.model';

type ScoreBand = 'excellent' | 'good' | 'average' | 'low';
type MatchingPart = { label: string; skillList: string[]; type: 'matched' | 'partial' | 'missing' };
type ProjectType = 'STAGE' | 'PROJET' | 'HACKATHON';

@Component({
  selector: 'b2u-company-candidatures',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './company-candidatures.component.html',
  styleUrls: ['./company-candidatures.component.scss']
})
export class CompanyCandidaturesComponent implements OnInit, OnDestroy {
  private service = inject(CandidatureService);
  private auth = inject(AuthService);
  private autoRefreshService = inject(AutoRefreshService);
  private cdr = inject(ChangeDetectorRef);

  candidatures: Candidature[] = [];
  allFilteredCandidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  selected?: Candidature;
  selectedMatchingParts: MatchingPart[] = [];

  loading = false;
  actionLoadingId = '';
  errorMessage = '';
  lastUpdate?: Date;

  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;

  searchTerm = '';
  showFilters = false;
  scoreMin = 0;
  scoreMax = 100;

  statusChecks: Record<string, boolean> = {
    'En cours': false,
    'En revue': false,
    'Acceptée': false,
    'Refusée': false,
    Recommandé: false,
    Présélectionné: false,
    'En attente': false,
    'Non retenu': false
  };

  scoreChecks: Record<ScoreBand, boolean> = {
    excellent: false,
    good: false,
    average: false,
    low: false
  };

  private refreshSubscription?: Subscription;
  private readonly componentId = 'company-candidatures';

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.pageIndex - 2);
    const end = Math.min(this.totalPages - 1, this.pageIndex + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get activeStatusFilters(): string[] {
    return Object.entries(this.statusChecks)
      .filter(([, active]) => active)
      .map(([status]) => status);
  }

  get activeScoreFilters(): ScoreBand[] {
    return Object.entries(this.scoreChecks)
      .filter(([, active]) => active)
      .map(([band]) => band as ScoreBand);
  }

  get activeFilterCount(): number {
    return (
      this.activeStatusFilters.length +
      this.activeScoreFilters.length +
      (this.searchTerm.trim() ? 1 : 0) +
      (this.scoreMin > 0 || this.scoreMax < 100 ? 1 : 0)
    );
  }

  get stats() {
    const total = this.candidatures.length;
    const accepted = this.candidatures.filter(c => this.normalizeStatus(c.statutCandidature) === 'Acceptée').length;
    const refused = this.candidatures.filter(c => this.normalizeStatus(c.statutCandidature) === 'Refusée').length;
    const pending = this.candidatures.filter(c => this.normalizeStatus(c.statutCandidature) === 'En cours').length;
    const strongMatches = this.candidatures.filter(c => (c.scoreMatching ?? 0) >= 65).length;
    const averageScore = total
      ? Math.round(this.candidatures.reduce((sum, c) => sum + (c.scoreMatching ?? 0), 0) / total)
      : 0;
    return { total, pending, accepted, refused, strongMatches, averageScore };
  }

  ngOnInit() {
    this.load();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  load() {
    this.loading = true;
    this.errorMessage = '';

    this.loadSource().subscribe({
      next: items => {
        this.setCandidatures(items || []);
        this.loading = false;
        this.lastUpdate = new Date();
        this.cdr.markForCheck();
      },
      error: err => {
        this.candidatures = [];
        this.allFilteredCandidatures = [];
        this.filteredCandidatures = [];
        this.totalItems = 0;
        this.loading = false;
        this.errorMessage = `Impossible de charger les candidatures (${err.status || 'erreur réseau'}).`;
        this.cdr.markForCheck();
      }
    });
  }

  refreshData() {
    this.autoRefreshService.forceRefresh(this.componentId);
    this.load();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.cdr.markForCheck();
  }

  resetFilters() {
    this.searchTerm = '';
    this.scoreMin = 0;
    this.scoreMax = 100;
    Object.keys(this.statusChecks).forEach(key => (this.statusChecks[key] = false));
    Object.keys(this.scoreChecks).forEach(key => (this.scoreChecks[key as ScoreBand] = false));
    this.pageIndex = 0;
    this.applyFilters();
  }

  onFilterChange() {
    if (this.scoreMin > this.scoreMax) {
      [this.scoreMin, this.scoreMax] = [this.scoreMax, this.scoreMin];
    }
    this.pageIndex = 0;
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.pageIndex = page;
    this.applyFilters();
  }

  onPageSizeChange() {
    this.pageIndex = 0;
    this.pageSize = Number(this.pageSize);
    this.applyFilters();
  }

  viewDetails(candidature: Candidature) {
    this.selected = this.enrich(candidature);
    this.selectedMatchingParts = this.parseMatchingDetails(candidature.matchingDetails);
    this.cdr.markForCheck();
  }

  closeDetails() {
    this.selected = undefined;
    this.selectedMatchingParts = [];
  }

  accept(candidature: Candidature) {
    this.updateStatus(candidature, 'ACCEPTEE');
  }

  reject(candidature: Candidature) {
    this.updateStatus(candidature, 'REFUSEE');
  }

  statusClass(status?: string): string {
    const map: Record<string, string> = {
      'Acceptée': 'accepted',
      'Refusée': 'rejected',
      'En cours': 'pending',
      'En revue': 'waiting',
      Recommandé: 'recommended',
      Présélectionné: 'preselected',
      'En attente': 'waiting',
      'Non retenu': 'rejected'
    };
    return map[this.normalizeStatus(status)] ?? 'unknown';
  }

  getStatusIcon(status?: string): string {
    const map: Record<string, string> = {
      'Acceptée': 'check_circle',
      'Refusée': 'cancel',
      'En cours': 'schedule',
      'En revue': 'rate_review',
      Recommandé: 'star',
      Présélectionné: 'bookmark',
      'En attente': 'hourglass_empty',
      'Non retenu': 'block'
    };
    return map[this.normalizeStatus(status)] ?? 'help';
  }

  displayStatus(status?: string): string {
    return this.normalizeStatus(status) || 'Inconnu';
  }

  getInitials(candidature: Candidature): string {
    return `${candidature.prenomCandidat?.charAt(0) || ''}${candidature.nomCandidat?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  getScorePercentage(score?: number): number {
    return score ?? 0;
  }

  getScoreColor(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return '#0E9F6E';
    if (value >= 65) return '#1A56DB';
    if (value >= 50) return '#D97706';
    if (value >= 35) return '#EA580C';
    return '#DC2626';
  }

  getScoreLabel(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'Excellent';
    if (value >= 65) return 'Très bon';
    if (value >= 50) return 'Bon';
    if (value >= 35) return 'Moyen';
    return 'Faible';
  }

  getRecoClass(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'reco-excellent';
    if (value >= 65) return 'reco-good';
    if (value >= 50) return 'reco-average';
    if (value >= 35) return 'reco-low';
    return 'reco-none';
  }

  getRecoIcon(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'verified';
    if (value >= 65) return 'thumb_up';
    if (value >= 50) return 'rule';
    if (value >= 35) return 'warning';
    return 'block';
  }

  getRecoLabel(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'Prioritaire';
    if (value >= 65) return 'Recommandé';
    if (value >= 50) return 'À considérer';
    if (value >= 35) return 'En réserve';
    return 'Peu adapté';
  }

  getRecoDescription(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'Profil très aligné avec les besoins du projet.';
    if (value >= 65) return 'Bon profil, à contacter rapidement.';
    if (value >= 50) return 'Profil intéressant avec quelques écarts.';
    if (value >= 35) return 'Profil partiel, utile en option secondaire.';
    return 'Profil peu aligné avec ce projet.';
  }

  parseMatchingDetails(details?: string): MatchingPart[] {
    if (!details) return [];
    return details.split('|').map(part => {
      const trimmed = part.trim();
      const colonIdx = trimmed.indexOf(':');
      const label = colonIdx > -1 ? trimmed.substring(0, colonIdx).trim() : trimmed;
      const raw = colonIdx > -1 ? trimmed.substring(colonIdx + 1).trim() : '';
      const skillList = raw
        ? raw
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => !!skill && !/^aucune$/i.test(skill))
        : [];
      if (/summary|recommendation/i.test(label)) return null;
      const type = /matched|compatibles|acquises/i.test(label)
        ? 'matched'
        : /partial|partiel/i.test(label)
          ? 'partial'
          : 'missing';
      return { label, skillList, type };
    }).filter((part): part is MatchingPart => !!part);
  }

  getInterviewPreparationLines(candidature?: Candidature): string[] {
    return candidature?.interviewPreparation
      ? candidature.interviewPreparation.split('\n').map(line => line.trim()).filter(Boolean)
      : [];
  }

  isPreparationHeading(line: string): boolean {
    return !line.match(/^[0-9]+\./) && !line.startsWith('-') && !line.toLowerCase().startsWith('reponse modele');
  }

  isPreparationAnswer(line: string): boolean {
    return line.toLowerCase().startsWith('reponse modele');
  }

  trackById(index: number, item: Candidature): string {
    return item.idCandidature || String(index);
  }

  private startAutoRefresh() {
    this.refreshSubscription = this.autoRefreshService
      .startAutoRefresh(this.componentId, () => this.loadSource())
      .subscribe({
        next: items => {
          this.setCandidatures(items || []);
          this.lastUpdate = new Date();
          this.cdr.markForCheck();
        }
      });
  }

  private stopAutoRefresh() {
    this.autoRefreshService.stopAutoRefresh(this.componentId);
    this.refreshSubscription?.unsubscribe();
  }

  private setCandidatures(items: Candidature[]) {
    this.candidatures = items
      .map(item => this.enrich(item))
      .sort((a, b) => this.compareNewestFirst(a, b));
    this.applyFilters();

    if (this.selected?.idCandidature) {
      const updatedSelected = this.candidatures.find(c => c.idCandidature === this.selected?.idCandidature);
      if (updatedSelected) this.viewDetails(updatedSelected);
    }
  }

  private enrich(candidature: Candidature): Candidature {
    return {
      ...candidature,
      statutCandidature: this.normalizeStatus(candidature.statutCandidature),
      _projectTitle: candidature.projectTitle || candidature._projectTitle || candidature.projectId,
      _initials: candidature._initials || this.getInitials(candidature),
      _scorePercent: this.getScorePercentage(candidature.scoreMatching)
    };
  }

  private applyFilters() {
    let filtered = [...this.candidatures];
    const search = this.searchTerm.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter(c =>
        [c.nomCandidat, c.prenomCandidat, c.email, c.formationActuelle, c.specialite, c.projectTitle, c._projectTitle, c.projectId]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(search))
      );
    }

    const activeStatus = this.activeStatusFilters;
    if (activeStatus.length) {
      filtered = filtered.filter(c => activeStatus.includes(this.normalizeStatus(c.statutCandidature)));
    }

    const activeScore = this.activeScoreFilters;
    if (activeScore.length) {
      filtered = filtered.filter(c => activeScore.some(band => this.isScoreInBand(c.scoreMatching, band)));
    }

    filtered = filtered.filter(c => {
      const score = c.scoreMatching ?? 0;
      return score >= this.scoreMin && score <= this.scoreMax;
    });

    filtered = filtered.sort((a, b) => this.compareNewestFirst(a, b));
    this.allFilteredCandidatures = filtered;
    this.totalItems = filtered.length;

    const maxPageIndex = Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) {
      this.pageIndex = maxPageIndex;
    }

    const start = this.pageIndex * this.pageSize;
    this.filteredCandidatures = filtered.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  private compareNewestFirst(a: Candidature, b: Candidature): number {
    const dateDiff = this.getCandidatureTime(b) - this.getCandidatureTime(a);
    if (dateDiff !== 0) return dateDiff;
    return (b.idCandidature || '').localeCompare(a.idCandidature || '');
  }

  private getCandidatureTime(candidature: Candidature): number {
    const time = candidature.dateCandidature ? new Date(candidature.dateCandidature).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  }

  private isScoreInBand(score = 0, band: ScoreBand): boolean {
    if (band === 'excellent') return score >= 80;
    if (band === 'good') return score >= 65 && score < 80;
    if (band === 'average') return score >= 50 && score < 65;
    return score < 50;
  }

  normalizeProjectType(type?: string): ProjectType {
    const normalized = (type || 'PROJET').trim().toUpperCase();
    if (normalized === 'STAGE' || normalized === 'HACKATHON') return normalized;
    return 'PROJET';
  }

  private updateStatus(candidature: Candidature, status: 'ACCEPTEE' | 'REFUSEE') {
    if (!candidature.idCandidature) return;
    this.actionLoadingId = candidature.idCandidature;

    this.service.update(candidature.idCandidature, { ...candidature, statutCandidature: status }).subscribe({
      next: updated => {
        const enriched = this.enrich(updated);
        this.candidatures = this.candidatures.map(c =>
          c.idCandidature === enriched.idCandidature ? enriched : c
        );
        this.applyFilters();
        if (this.selected?.idCandidature === enriched.idCandidature) this.viewDetails(enriched);
        this.actionLoadingId = '';
        this.cdr.markForCheck();
      },
      error: err => {
        this.errorMessage = `Impossible de mettre à jour la candidature (${err.status || 'erreur réseau'}).`;
        this.actionLoadingId = '';
        this.cdr.markForCheck();
      }
    });
  }

  private loadSource() {
    const user = this.auth.getCurrentUser();
    if (!user) {
      return this.service.getPaged(this.pageIndex, this.pageSize).pipe(map(response => response.items));
    }

    const companyKeys = [user.id, user.email, user.companyName]
      .filter((value): value is string => !!value && value.trim().length > 0)
      .filter((value, index, values) => values.indexOf(value) === index);

    if (!companyKeys.length) {
      return this.service.getAll();
    }

    return forkJoin([
      ...companyKeys.map(key => this.service.getByCompany(key)),
      this.service.getAll()
    ]).pipe(
      map(groups => {
        const byId = new Map<string, Candidature>();
        groups.flat()
          .forEach(item => byId.set(item.idCandidature || `${item.email}-${item.projectId}`, item));
        return Array.from(byId.values());
      })
    );
  }

  private normalizeStatus(status?: string): string {
    const raw = (status || '').trim().replaceAll('\u00c3\u00a9', 'é');
    const upper = raw.toUpperCase();
    const map: Record<string, string> = {
      'ACCEPTÉE': 'Acceptée',
      ACCEPTEE: 'Acceptée',
      REFUSEE: 'Refusée',
      'REFUSÉE': 'Refusée',
      RECOMMANDE: 'Recommandé',
      'RECOMMANDÉ': 'Recommandé',
      PRESELECTIONNE: 'Présélectionné',
      'PRÉSÉLECTIONNÉ': 'Présélectionné',
      EN_ATTENTE: 'En attente',
      EN_COURS: 'En cours',
      EN_REVUE: 'En revue',
      NON_RETENU: 'Non retenu'
    };
    return map[upper] ?? raw;
  }
}
