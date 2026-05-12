import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { Candidature } from '../../../core/models/candidature.model';
import { CandidatureService } from '../../../core/services/candidature.service';
import { AutoRefreshService } from '../../../core/services/auto-refresh.service';

@Component({
  selector: 'app-admin-candidatures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './admin-candidatures.component.html',
  styleUrls: ['./admin-candidatures.component.scss']
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminCandidaturesComponent implements OnInit, OnDestroy {
  candidatures: Candidature[] = [];
  filteredCandidatures: Candidature[] = [];
  // pagination
  pageIndex = 0;
  pageSize = 10;
  totalItems = 0;
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalItems / this.pageSize)); }
  get pageNumbers(): number[] {
    const total = this.totalPages;
    const cur = this.pageIndex;
    const pages: number[] = [];
    for (let i = Math.max(0, cur - 2); i <= Math.min(total - 1, cur + 2); i++) pages.push(i);
    return pages;
  }
  selected?: Candidature;
  loading = false;
  lastUpdate?: Date;
  searchTerm = '';
  statusFilter = 'all';
  scoreFilter = 'all';
  showFilters = false;
  scoreMin = 0;
  scoreMax = 100;
  statusChecks: Record<string, boolean> = {
    'En cours': false, 'Acceptée': false, 'Refusée': false,
    'RECOMMANDE': false, 'PRESELECTIONNE': false, 'EN_ATTENTE': false, 'NON_RETENU': false
  };
  scoreChecks: Record<string, boolean> = { excellent: false, good: false, average: false, low: false };
  get activeFilterCount(): number {
    return Object.values(this.statusChecks).filter(v => v).length +
           Object.values(this.scoreChecks).filter(v => v).length +
           (this.searchTerm.trim() ? 1 : 0) +
           (this.scoreMin > 0 || this.scoreMax < 100 ? 1 : 0);
  }
  resetFilters() {
    this.searchTerm = ''; this.scoreMin = 0; this.scoreMax = 100;
    Object.keys(this.statusChecks).forEach(k => this.statusChecks[k] = false);
    Object.keys(this.scoreChecks).forEach(k => this.scoreChecks[k] = false);
    this.applyFilters();
    this.cdr.markForCheck();
  }

  private componentId = 'admin-candidatures';
  private refreshSubscription?: Subscription;

  constructor(
    private service: CandidatureService,
    private autoRefreshService: AutoRefreshService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.load();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }

  private startAutoRefresh() {
    this.refreshSubscription = this.autoRefreshService
      .startAutoRefresh(
        this.componentId,
        () => this.service.getPaged(this.pageIndex, this.pageSize).pipe(map(r => r.items))
      )
      .subscribe({
        next: data => {
          this.candidatures = (data || []).map(item => ({
            ...item,
            _initials: `${item.prenomCandidat?.charAt(0) || ''}${item.nomCandidat?.charAt(0) || ''}`.toUpperCase(),
            _scorePercent: this.getScorePercentage(item.scoreMatching)
          } as Candidature & any));
          this.applyFilters();
          this.lastUpdate = new Date();
          this.cdr.markForCheck();
        },
        error: () => {
          console.warn('⚠️ Échec du rafraîchissement automatique (admin)');
        }
      });
  }

  private stopAutoRefresh() {
    this.autoRefreshService.stopAutoRefresh(this.componentId);
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  load() {
    this.loading = true;
    this.service.getPaged(this.pageIndex, this.pageSize).subscribe({
      next: resp => {
        this.candidatures = (resp.items || []).map(item => ({
          ...item,
          _initials: `${item.prenomCandidat?.charAt(0) || ''}${item.nomCandidat?.charAt(0) || ''}`.toUpperCase(),
          _scorePercent: this.getScorePercentage(item.scoreMatching)
        } as Candidature & any));
        this.totalItems = resp.total ?? resp.items.length;
        this.applyFilters();
        this.loading = false;
        this.lastUpdate = new Date();
        this.cdr.markForCheck();
      },
      error: () => {
        this.candidatures = [];
        this.filteredCandidatures = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex ?? this.pageIndex;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.load();
  }

  goToPage(p: number) {
    if (p < 0 || p >= this.totalPages) return;
    this.pageIndex = p;
    this.load();
  }

  onPageSizeChange() {
    this.pageIndex = 0;
    this.pageSize = Number(this.pageSize); // select returns string
    this.load();
  }

  refreshData() {
    this.autoRefreshService.forceRefresh(this.componentId);
    this.load();
  }

  onSearchChange() { this.applyFilters(); }
  onStatusFilterChange() { this.applyFilters(); }
  onScoreFilterChange() { this.applyFilters(); }
  onFilterChange() { this.applyFilters(); this.cdr.markForCheck(); }

  private applyFilters() {
    let filtered = this.candidatures;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nomCandidat?.toLowerCase().includes(term) ||
        c.prenomCandidat?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.formationActuelle?.toLowerCase().includes(term) ||
        c.specialite?.toLowerCase().includes(term)
      );
    }
    const activeStatus = Object.entries(this.statusChecks).filter(([,v]) => v).map(([k]) => k);
    if (activeStatus.length > 0) {
      filtered = filtered.filter(c => activeStatus.includes(c.statutCandidature || ''));
    }
    const activeScore = Object.entries(this.scoreChecks).filter(([,v]) => v).map(([k]) => k);
    if (activeScore.length > 0) {
      filtered = filtered.filter(c => {
        const s = c.scoreMatching ?? 0;
        return activeScore.some(k => {
          if (k === 'excellent') return s >= 80;
          if (k === 'good')      return s >= 65 && s < 80;
          if (k === 'average')   return s >= 50 && s < 65;
          if (k === 'low')       return s < 50;
          return false;
        });
      });
    }
    filtered = filtered.filter(c => { const s = c.scoreMatching ?? 0; return s >= this.scoreMin && s <= this.scoreMax; });
    this.filteredCandidatures = filtered;
  }

  accept(c: Candidature) {
    this.service.update(c.idCandidature!, { ...c, statutCandidature: 'Acceptée' }).subscribe({
      next: updated => {
        this.updateCandidatureInList(updated);
      }
    });
  }

  reject(c: Candidature) {
    this.service.update(c.idCandidature!, { ...c, statutCandidature: 'Refusée' }).subscribe({
      next: updated => {
        this.updateCandidatureInList(updated);
      }
    });
  }

  private updateCandidatureInList(updated: Candidature) {
    this.candidatures = this.candidatures.map(x =>
      x.idCandidature === updated.idCandidature ? updated : x
    );
    this.applyFilters();
    if (this.selected?.idCandidature === updated.idCandidature) {
      this.selected = updated;
    }
  }

  statusClass(s: string): string {
    return s === 'Acceptée' ? 'accepted' :
           s === 'Refusée' ? 'rejected' :
           s === 'En cours' ? 'pending' :
           s === 'RECOMMANDE' ? 'recommended' :
           s === 'PRESELECTIONNE' ? 'preselected' :
           s === 'EN_ATTENTE' ? 'waiting' : 'unknown';
  }

  trackById(index: number, item: Candidature): string {
    return item.idCandidature || index.toString();
  }

  viewDetails(candidature: Candidature) {
    this.selected = {
      ...candidature,
      _initials: candidature._initials || `${candidature.prenomCandidat?.charAt(0) || ''}${candidature.nomCandidat?.charAt(0) || ''}`.toUpperCase(),
      _scorePercent: candidature._scorePercent ?? this.getScorePercentage(candidature.scoreMatching)
    } as Candidature & any;
  }

  closeDetails() {
    this.selected = undefined;
  }

  getInitials(nom?: string, prenom?: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  getScorePercentage(score?: number): number { return score ?? 0; }

  getScoreColor(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return '#10B981';
    if (s >= 65) return '#3B82F6';
    if (s >= 50) return '#F59E0B';
    if (s >= 35) return '#F97316';
    return '#EF4444';
  }

  getScoreLabel(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return 'Excellent';
    if (s >= 65) return 'Très bon';
    if (s >= 50) return 'Bon';
    if (s >= 35) return 'Moyen';
    return 'Faible';
  }

  getRecoClass(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return 'reco-excellent';
    if (s >= 65) return 'reco-good';
    if (s >= 50) return 'reco-average';
    if (s >= 35) return 'reco-low';
    return 'reco-none';
  }

  getRecoIcon(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return 'verified';
    if (s >= 65) return 'thumb_up';
    if (s >= 50) return 'thumbs_up_down';
    if (s >= 35) return 'warning';
    return 'block';
  }

  getRecoLabel(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return 'Fortement recommandé';
    if (s >= 65) return 'Recommandé';
    if (s >= 50) return 'Conditionnel';
    if (s >= 35) return 'Limité';
    return 'Non recommandé';
  }

  getRecoDescription(score?: number): string {
    const s = score ?? 0;
    if (s >= 80) return 'Profil idéal — inviter en entretien en priorité';
    if (s >= 65) return 'Très bon profil — à contacter rapidement';
    if (s >= 50) return 'Profil intéressant — à considérer si pas de meilleur candidat';
    if (s >= 35) return 'Profil partiel — garder en réserve';
    return 'Profil inadapté — ne pas retenir pour ce poste';
  }

  parseMatchingDetails(details: string): { label: string; skills: string; type: string }[] {
    if (!details) return [];
    return details.split('|').map(part => {
      const trimmed = part.trim();
      const isMatched = trimmed.startsWith('Matched');
      const colonIdx = trimmed.indexOf(':');
      const label = colonIdx > -1 ? trimmed.substring(0, colonIdx).trim() : trimmed;
      const skills = colonIdx > -1 ? trimmed.substring(colonIdx + 1).trim() : '';
      return { label, skills, type: isMatched ? 'matched' : 'missing' };
    });
  }

  getStatusOptions() {
    return [
      { value: 'all', label: 'Tous les statuts' },
      { value: 'En cours', label: 'En cours' },
      { value: 'Acceptée', label: 'Acceptée' },
      { value: 'Refusée', label: 'Refusée' },
      { value: 'RECOMMANDE', label: 'Recommandé' },
      { value: 'PRESELECTIONNE', label: 'Pré-sélectionné' },
      { value: 'EN_ATTENTE', label: 'En attente' },
      { value: 'NON_RETENU', label: 'Non retenu' },
    ];
  }

  get stats() {
    return {
      total: this.candidatures.length,
      enCours: this.candidatures.filter(c => c.statutCandidature === 'En cours').length,
      accepte: this.candidatures.filter(c => c.statutCandidature === 'Acceptée').length,
      refuse: this.candidatures.filter(c => c.statutCandidature === 'Refusée').length,
      recommande: this.candidatures.filter(c => c.statutCandidature === 'RECOMMANDE').length,
      preselectionne: this.candidatures.filter(c => c.statutCandidature === 'PRESELECTIONNE').length,
      enAttente: this.candidatures.filter(c => c.statutCandidature === 'EN_ATTENTE').length
    };
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Acceptée': return 'check_circle';
      case 'Refusée': return 'cancel';
      case 'En cours': return 'schedule';
      case 'RECOMMANDE': return 'star';
      case 'PRESELECTIONNE': return 'bookmark';
      case 'EN_ATTENTE': return 'hourglass_empty';
      default: return 'help';
    }
  }