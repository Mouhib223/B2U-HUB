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

import { Candidature } from '../../core/models/candidature.model';
import { CandidatureService } from '../../core/services/candidature.service';
import { AutoRefreshService } from '../../core/services/auto-refresh.service';

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
  allFilteredCandidatures: Candidature[] = [];
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
  showFilters = false;
  projectFilter = '';
  companyFilter = '';
  formationFilter = '';
  specialiteFilter = '';
  dateFrom = '';
  dateTo = '';
  experienceMin: number | null = null;
  experienceMax: number | null = null;
  statusChecks: Record<string, boolean> = {
    'En cours': false,
    'En revue': false,
    'Acceptee': false,
    'Refusee': false
  };

  get activeFilterCount(): number {
    return Object.values(this.statusChecks).filter(v => v).length +
           (this.projectFilter ? 1 : 0) +
           (this.companyFilter ? 1 : 0) +
           (this.formationFilter ? 1 : 0) +
           (this.specialiteFilter ? 1 : 0) +
           (this.dateFrom ? 1 : 0) +
           (this.dateTo ? 1 : 0) +
           (this.experienceMin !== null && this.experienceMin !== undefined ? 1 : 0) +
           (this.experienceMax !== null && this.experienceMax !== undefined ? 1 : 0) +
           (this.searchTerm.trim() ? 1 : 0);
  }

  resetFilters() {
    this.searchTerm = '';
    this.projectFilter = '';
    this.companyFilter = '';
    this.formationFilter = '';
    this.specialiteFilter = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.experienceMin = null;
    this.experienceMax = null;
    Object.keys(this.statusChecks).forEach(k => this.statusChecks[k] = false);
    this.pageIndex = 0;
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
        () => this.service.getAll()
      )
      .subscribe({
        next: data => {
          this.candidatures = this.enrich(data || []);
          this.applyFilters();
          this.lastUpdate = new Date();
          this.cdr.markForCheck();
        },
        error: () => {
          console.warn('âš ï¸ Ã‰chec du rafraÃ®chissement automatique (admin)');
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
    this.service.getAll().subscribe({
      next: items => {
        this.candidatures = this.enrich(items || []);
        this.applyFilters();
        this.loading = false;
        this.lastUpdate = new Date();
        this.cdr.markForCheck();
      },
      error: () => {
        this.candidatures = [];
        this.allFilteredCandidatures = [];
        this.filteredCandidatures = [];
        this.totalItems = 0;
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex ?? this.pageIndex;
    this.pageSize = event.pageSize ?? this.pageSize;
    this.applyFilters();
  }

  goToPage(p: number) {
    if (p < 0 || p >= this.totalPages) return;
    this.pageIndex = p;
    this.applyFilters();
  }

  onPageSizeChange() {
    this.pageIndex = 0;
    this.pageSize = Number(this.pageSize); // select returns string
    this.applyFilters();
  }

  refreshData() {
    this.autoRefreshService.forceRefresh(this.componentId);
    this.load();
  }

  onSearchChange() { this.pageIndex = 0; this.applyFilters(); }
  onStatusFilterChange() { this.pageIndex = 0; this.applyFilters(); }
  onFilterChange() { this.pageIndex = 0; this.applyFilters(); this.cdr.markForCheck(); }

  private applyFilters() {
    let filtered = [...this.candidatures];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.nomCandidat?.toLowerCase().includes(term) ||
        c.prenomCandidat?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.projectTitle?.toLowerCase().includes(term) ||
        c.projectId?.toLowerCase().includes(term) ||
        c.companyName?.toLowerCase().includes(term) ||
        c.formationActuelle?.toLowerCase().includes(term) ||
        c.specialite?.toLowerCase().includes(term)
      );
    }
    const activeStatus = Object.entries(this.statusChecks).filter(([,v]) => v).map(([k]) => k);
    if (activeStatus.length > 0) {
      filtered = filtered.filter(c => activeStatus.includes(this.normalizeStatusLabel(this.displayStatus(c.statutCandidature))));
    }

    if (this.projectFilter) {
      filtered = filtered.filter(c => this.getProjectLabel(c) === this.projectFilter);
    }

    if (this.companyFilter) {
      filtered = filtered.filter(c => (c.companyName || 'N/A') === this.companyFilter);
    }

    if (this.formationFilter) {
      filtered = filtered.filter(c => (c.formationActuelle || 'N/A') === this.formationFilter);
    }

    if (this.specialiteFilter) {
      filtered = filtered.filter(c => (c.specialite || 'N/A') === this.specialiteFilter);
    }

    if (this.experienceMin !== null && this.experienceMin !== undefined) {
      filtered = filtered.filter(c => (c.anneeExperience ?? 0) >= Number(this.experienceMin));
    }

    if (this.experienceMax !== null && this.experienceMax !== undefined) {
      filtered = filtered.filter(c => (c.anneeExperience ?? 0) <= Number(this.experienceMax));
    }

    if (this.dateFrom) {
      const from = new Date(this.dateFrom).setHours(0, 0, 0, 0);
      filtered = filtered.filter(c => this.getTime(c.dateCandidature) >= from);
    }

    if (this.dateTo) {
      const to = new Date(this.dateTo).setHours(23, 59, 59, 999);
      filtered = filtered.filter(c => this.getTime(c.dateCandidature) <= to);
    }

    filtered = filtered.sort((a, b) => this.getTime(b.dateCandidature) - this.getTime(a.dateCandidature));
    this.allFilteredCandidatures = filtered;
    this.totalItems = filtered.length;
    const maxPageIndex = Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);
    if (this.pageIndex > maxPageIndex) this.pageIndex = maxPageIndex;
    const start = this.pageIndex * this.pageSize;
    this.filteredCandidatures = filtered.slice(start, start + this.pageSize);
  }

  deleteCandidature(candidature: Candidature) {
    if (!candidature.idCandidature) return;
    const confirmed = confirm(`Supprimer la candidature de ${candidature.prenomCandidat} ${candidature.nomCandidat} ?`);
    if (!confirmed) return;

    this.service.delete(candidature.idCandidature).subscribe({
      next: () => {
        this.candidatures = this.candidatures.filter(item => item.idCandidature !== candidature.idCandidature);
        if (this.selected?.idCandidature === candidature.idCandidature) {
          this.selected = undefined;
        }
        this.applyFilters();
        this.cdr.markForCheck();
      }
    });
  }

  private updateCandidatureInList(updated: Candidature) {
    const enriched = this.enrichOne(updated);
    this.candidatures = this.candidatures.map(x =>
      x.idCandidature === enriched.idCandidature ? enriched : x
    );
    this.applyFilters();
    if (this.selected?.idCandidature === enriched.idCandidature) {
      this.selected = enriched;
    }
  }

  private enrich(items: Candidature[]): Candidature[] {
    return items.map(item => this.enrichOne(item));
  }

  private enrichOne(item: Candidature): Candidature {
    return {
      ...item,
      statutCandidature: this.displayStatus(item.statutCandidature),
      _initials: `${item.prenomCandidat?.charAt(0) || ''}${item.nomCandidat?.charAt(0) || ''}`.toUpperCase(),
      _projectTitle: item.projectTitle || item.projectId
    } as Candidature & any;
  }

  displayStatus(status?: string): string {
    const raw = (status || '').trim().toUpperCase()
      .replace('Ã‰', 'E')
      .replace('Ãˆ', 'E')
      .replace('ÃŠ', 'E')
      .replace('ÃƒÂ©', 'E')
      .replace('Ãƒâ€°', 'E')
      .replace(' ', '_');
    const map: Record<string, string> = {
      ACCEPTEE: 'Acceptée',
      REFUSEE: 'Refusée',
      EN_COURS: 'En cours',
      EN_REVUE: 'En revue',
      RECOMMANDE: 'Recommandé',
      PRESELECTIONNE: 'Présélectionné',
      EN_ATTENTE: 'En attente',
      NON_RETENU: 'Non retenu'
    };
    return map[raw] ?? (status || 'Inconnu');
  }

  private normalizeStatusLabel(status?: string): string {
    const value = (status || '').trim();
    if (value === 'Acceptée' || value === 'ACCEPTEE') return 'Acceptee';
    if (value === 'Refusée' || value === 'REFUSEE') return 'Refusee';
    if (value === 'EN_COURS') return 'En cours';
    if (value === 'EN_REVUE') return 'En revue';
    return value;
  }

  statusClass(s: string): string {
    const status = this.normalizeStatusLabel(this.displayStatus(s));
    return status === 'Acceptee' ? 'accepted' :
           status === 'Refusee' ? 'rejected' :
           status === 'En cours' ? 'pending' :
           status === 'En revue' ? 'waiting' : 'unknown';
  }

  trackById(index: number, item: Candidature): string {
    return item.idCandidature || index.toString();
  }

  viewDetails(candidature: Candidature) {
    this.selected = {
      ...candidature,
      _initials: candidature._initials || `${candidature.prenomCandidat?.charAt(0) || ''}${candidature.nomCandidat?.charAt(0) || ''}`.toUpperCase(),
      _projectTitle: candidature.projectTitle || candidature._projectTitle || candidature.projectId
    } as Candidature & any;
  }

  closeDetails() {
    this.selected = undefined;
  }

  getInitials(nom?: string, prenom?: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase() || '?';
  }

  get projectOptions(): string[] {
    return this.uniqueOptions(this.candidatures.map(c => this.getProjectLabel(c)));
  }

  get companyOptions(): string[] {
    return this.uniqueOptions(this.candidatures.map(c => c.companyName || 'N/A'));
  }

  get formationOptions(): string[] {
    return this.uniqueOptions(this.candidatures.map(c => c.formationActuelle || 'N/A'));
  }

  get specialiteOptions(): string[] {
    return this.uniqueOptions(this.candidatures.map(c => c.specialite || 'N/A'));
  }

  private getProjectLabel(candidature: Candidature): string {
    return candidature._projectTitle || candidature.projectTitle || candidature.projectId || 'N/A';
  }

  private uniqueOptions(values: string[]): string[] {
    return Array.from(new Set(values.map(v => (v || 'N/A').trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b));
  }

  private getTime(date?: string): number {
    const time = date ? new Date(date).getTime() : 0;
    return Number.isNaN(time) ? 0 : time;
  }

  get stats() {
    return {
      total: this.candidatures.length,
      enCours: this.candidatures.filter(c => this.normalizeStatusLabel(c.statutCandidature) === 'En cours').length,
      accepte: this.candidatures.filter(c => this.normalizeStatusLabel(c.statutCandidature) === 'Acceptee').length,
      refuse: this.candidatures.filter(c => this.normalizeStatusLabel(c.statutCandidature) === 'Refusee').length
    };
  }

  getStatusIcon(status: string): string {
    switch (this.normalizeStatusLabel(this.displayStatus(status))) {
      case 'Acceptee': return 'check_circle';
      case 'Refusee': return 'cancel';
      case 'En cours': return 'schedule';
      case 'En revue': return 'hourglass_empty';
      default: return 'help';
    }
  }

}



