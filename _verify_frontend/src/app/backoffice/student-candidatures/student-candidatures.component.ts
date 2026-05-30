import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AutoRefreshService } from '../../core/services/auto-refresh.service';
import { CandidatureService } from '../../core/services/candidature.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProjectService } from '../../core/services/project.service';
import { AiAssistantService } from '../../core/services/ai-assistant.service';
import { Candidature } from '../../core/models/candidature.model';
import { StudentNotification } from '../../core/models/notification.model';
import { Project } from '../../core/models/project.model';

type ScoreBand = 'excellent' | 'good' | 'average' | 'low';

@Component({
  selector: 'b2u-student-candidatures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './student-candidatures.component.html',
  styleUrls: ['./student-candidatures.component.scss']
})
export class StudentCandidaturesComponent implements OnInit, OnDestroy {
  private service = inject(CandidatureService);
  private projectService = inject(ProjectService);
  private notificationService = inject(NotificationService);
  private auth = inject(AuthService);
  private autoRefresh = inject(AutoRefreshService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private aiService = inject(AiAssistantService);

  feedbackMap: Record<string, { loading: boolean; text?: string }> = {};

  private allCandidatures: Candidature[] = [];
  displayed: Candidature[] = [];
  projects: Project[] = [];
  selectedProjectForApply?: Project;

  loading = true;
  saving = false;
  showModal = false;
  showFilters = false;
  submitted = false;
  errorMessage = '';
  lastUpdate = new Date();
  detailSelected?: Candidature;
  detailMatchingParts: { label: string; skillList: string[]; type: string }[] = [];
  notifications: StudentNotification[] = [];

  pageIndex = 0;
  pageSize = 6;
  totalItems = 0;

  searchTerm = '';
  scoreMin = 0;
  scoreMax = 100;

  statusChecks: Record<string, boolean> = {
    'En cours': false,
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

  readonly formations = ['Licence', 'Master', 'Ingénieur', 'Doctorat', 'BTS'];
  readonly maxFileSize = 5 * 1024 * 1024;
  cvFile?: File;
  lettreFile?: File;
  cvError = '';
  lettreError = '';

  form = this.fb.group({
    nomCandidat: ['', Validators.required],
    prenomCandidat: ['', Validators.required],
    telephone: ['', Validators.required],
    adresse: [''],
    formationActuelle: [''],
    specialite: [''],
    anneeExperience: [0, Validators.min(0)],
    projetId: ['', Validators.required]
  });

  private sub?: Subscription;
  private readonly componentId = 'student-candidatures';

  get f() {
    return this.form.controls;
  }

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
      .filter(([, value]) => value)
      .map(([status]) => status);
  }

  get activeScoreFilters(): ScoreBand[] {
    return Object.entries(this.scoreChecks)
      .filter(([, value]) => value)
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

  get totalCount(): number {
    return this.allCandidatures.length;
  }

  get countEnCours(): number {
    return this.countByStatus('En cours');
  }

  get countAccepted(): number {
    return this.countByStatus('Acceptée');
  }

  get countRefused(): number {
    return this.countByStatus('Refusée');
  }

  get countRecommended(): number {
    return this.allCandidatures.filter(c => (c.scoreMatching ?? 0) >= 65).length;
  }

  get bestScore(): number {
    return this.allCandidatures.reduce((best, item) => Math.max(best, item.scoreMatching ?? 0), 0);
  }

  get averageScore(): number {
    if (!this.allCandidatures.length) return 0;
    const total = this.allCandidatures.reduce((sum, item) => sum + (item.scoreMatching ?? 0), 0);
    return Math.round(total / this.allCandidatures.length);
  }

  get unreadNotifications(): StudentNotification[] {
    return this.notifications.filter(notification => !notification.read);
  }

  ngOnInit() {
    this.loadProjects();
    this.load();
    this.loadNotifications();
    this.openProjectApplicationFromRoute();
    this.sub = this.autoRefresh
      .startAutoRefresh(this.componentId, () => {
        const email = this.auth.getCurrentUser()?.email;
        return email ? this.service.getByEmail(email) : of([]);
      })
      .subscribe({
        next: items => {
          this.setCandidatures(items);
          this.loadNotifications();
          this.lastUpdate = new Date();
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    this.autoRefresh.stopAutoRefresh(this.componentId);
    this.sub?.unsubscribe();
  }

  load() {
    const email = this.auth.getCurrentUser()?.email;
    if (!email) {
      this.loading = false;
      this.errorMessage = 'Session introuvable. Merci de vous reconnecter.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.service.getByEmail(email).subscribe({
      next: items => {
        this.setCandidatures(items);
        this.loadNotifications();
        this.loading = false;
        this.lastUpdate = new Date();
        this.cdr.detectChanges();
      },
      error: err => {
        this.allCandidatures = [];
        this.displayed = [];
        this.totalItems = 0;
        this.loading = false;
        this.errorMessage = `Impossible de charger vos candidatures (${err.status || 'erreur réseau'}).`;
        this.cdr.detectChanges();
      }
    });
  }

  refreshData() {
    this.autoRefresh.forceRefresh(this.componentId);
    this.load();
    this.loadNotifications();
  }

  loadNotifications() {
    const email = this.auth.getCurrentUser()?.email;
    if (!email) return;

    this.notificationService.getByStudent(email).subscribe({
      next: notifications => {
        this.notifications = notifications || [];
        this.cdr.detectChanges();
      }
    });
  }

  markNotificationAsRead(notification: StudentNotification) {
    if (!notification.id) return;
    this.notificationService.markAsRead(notification.id).subscribe({
      next: updated => {
        this.notifications = this.notifications.map(item =>
          item.id === updated.id ? updated : item
        );
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
    this.cdr.detectChanges();

    if (this.showFilters) {
      setTimeout(() => {
        document.querySelector('.filter-panel')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    }
  }

  applyFilters() {
    this.pageIndex = 0;
    this.applyPage();
  }

  goToPage(page: number) {
    if (page < 0 || page >= this.totalPages) return;
    this.pageIndex = page;
    this.applyPage();
  }

  onPageSizeChange() {
    this.pageSize = Number(this.pageSize);
    this.pageIndex = 0;
    this.applyPage();
  }

  onFilterChange() {
    if (this.scoreMin > this.scoreMax) {
      [this.scoreMin, this.scoreMax] = [this.scoreMax, this.scoreMin];
    }
    this.applyFilters();
  }

  resetFilters() {
    this.searchTerm = '';
    this.scoreMin = 0;
    this.scoreMax = 100;
    Object.keys(this.statusChecks).forEach(key => (this.statusChecks[key] = false));
    Object.keys(this.scoreChecks).forEach(key => (this.scoreChecks[key as ScoreBand] = false));
    this.applyFilters();
  }

  openCreate(project?: Project) {
    this.selectedProjectForApply = project;
    this.form.reset({ anneeExperience: 0, projetId: project?.id ?? '' });
    this.submitted = false;
    this.errorMessage = '';
    this.cvFile = undefined;
    this.lettreFile = undefined;
    this.cvError = '';
    this.lettreError = '';
    this.showModal = true;
  }

  openDetail(candidature: Candidature) {
    this.detailSelected = candidature;
    this.detailMatchingParts = this.parseMatchingDetails(candidature.matchingDetails);
    this.cdr.detectChanges();
  }

  closeDetail() {
    this.detailSelected = undefined;
    this.detailMatchingParts = [];
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

  onCvSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.cvError = '';
    this.cvFile = undefined;
    const error = this.validatePdf(file);
    if (error) this.cvError = error;
    else this.cvFile = file;
  }

  onLettreSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.lettreError = '';
    this.lettreFile = undefined;
    const error = this.validatePdf(file);
    if (error) this.lettreError = error;
    else this.lettreFile = file;
  }

  validatePdf(file?: File): string | null {
    if (!file) return 'Fichier requis';
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    if (!type.includes('pdf') && !name.endsWith('.pdf')) return 'Le fichier doit être un PDF';
    if (file.size > this.maxFileSize) return 'Taille maximale 5 MB';
    return null;
  }

  save() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Merci de remplir les champs obligatoires.';
      return;
    }

    this.cvError = this.validatePdf(this.cvFile) ?? '';
    this.lettreError = this.validatePdf(this.lettreFile) ?? '';
    if (this.cvError || this.lettreError) {
      this.errorMessage = 'Ajoutez un CV et une lettre de motivation au format PDF.';
      return;
    }

    const val = this.form.getRawValue();
    const dto = {
      nomCandidat: val.nomCandidat ?? '',
      prenomCandidat: val.prenomCandidat ?? '',
      email: this.auth.getCurrentUser()?.email ?? '',
      telephone: val.telephone ?? '',
      adresse: val.adresse ?? '',
      formationActuelle: val.formationActuelle ?? '',
      specialite: val.specialite ?? '',
      anneeExperience: val.anneeExperience ?? 0,
      dateCandidature: new Date().toISOString().split('T')[0],
      projectId: val.projetId ?? '',
      statutCandidature: 'En cours'
    };

    this.saving = true;
    this.service.createWithFiles(dto, this.cvFile!, this.lettreFile!).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.submitted = false;
        this.cvFile = undefined;
        this.lettreFile = undefined;
        this.load();
      },
      error: err => {
        this.saving = false;
        this.errorMessage = `Candidature non sauvegardée (${err.status || 'erreur réseau'}).`;
        this.cdr.detectChanges();
      }
    });
  }

  getProjectTitle(projectId?: string): string {
    if (!projectId) return 'Projet non défini';
    return this.projects.find(project => project.id === projectId)?.title ?? projectId;
  }

  getSelectedProjectTitle(): string {
    const projectId = this.form.get('projetId')?.value || this.selectedProjectForApply?.id;
    return this.selectedProjectForApply?.title || this.getProjectTitle(projectId ?? undefined);
  }

  displayStatus(status?: string): string {
    const normalized = this.normalizeStatus(status);
    return normalized || 'Statut inconnu';
  }

  statusClass(status?: string): string {
    const map: Record<string, string> = {
      'Acceptée': 'accepted',
      'Refusée': 'rejected',
      'En cours': 'pending',
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
      Recommandé: 'star',
      Présélectionné: 'bookmark',
      'En attente': 'hourglass_empty',
      'Non retenu': 'block'
    };
    return map[this.normalizeStatus(status)] ?? 'help';
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
    if (value >= 80) return 'Très forte compatibilité';
    if (value >= 65) return 'Bonne compatibilité';
    if (value >= 50) return 'Compatibilité correcte';
    if (value >= 35) return 'Compatibilité limitée';
    return 'Peu compatible';
  }

  getRecoDescription(score?: number): string {
    const value = score ?? 0;
    if (value >= 80) return 'Votre profil correspond très bien aux attentes du projet.';
    if (value >= 65) return 'Votre candidature est solide, avec quelques points à renforcer.';
    if (value >= 50) return 'Le profil est intéressant mais plusieurs compétences peuvent manquer.';
    if (value >= 35) return 'La candidature reste recevable, mais le matching est partiel.';
    return 'Le projet semble peu aligné avec votre profil actuel.';
  }

  parseMatchingDetails(details?: string): { label: string; skillList: string[]; type: string }[] {
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
            .filter(Boolean)
        : [];
      const type = /matched|compatibles|acquises/i.test(label) ? 'matched' : 'missing';
      return { label, skillList, type };
    });
  }

  isRefused(status?: string): boolean {
    const s = this.normalizeStatus(status);
    return s === 'Refusée' || s === 'Non retenu';
  }

  generateFeedback(c: Candidature): void {
    const id = c.idCandidature!;
    this.feedbackMap[id] = { loading: true };
    this.cdr.detectChanges();
    this.aiService.generateCandidatureFeedback(id).subscribe({
      next: (res) => {
        this.feedbackMap[id] = { loading: false, text: res.feedback };
        this.cdr.detectChanges();
      },
      error: () => {
        this.feedbackMap[id] = { loading: false, text: 'Erreur lors de la génération. Réessayez.' };
        this.cdr.detectChanges();
      }
    });
  }

  trackById(index: number, item: Candidature): string {
    return item.idCandidature || String(index);
  }

  getInitials(candidature: Candidature): string {
    return `${candidature.prenomCandidat?.charAt(0) || ''}${candidature.nomCandidat?.charAt(0) || ''}`.toUpperCase();
  }

  private setCandidatures(items: Candidature[]) {
    this.allCandidatures = this.enrich(items).sort((a, b) => {
      const dateA = new Date(a.dateCandidature || 0).getTime();
      const dateB = new Date(b.dateCandidature || 0).getTime();
      return dateB - dateA;
    });
    this.applyFilters();
  }

  private enrich(items: Candidature[]): Candidature[] {
    return items.map(item => ({
      ...item,
      statutCandidature: this.normalizeStatus(item.statutCandidature),
      _projectTitle: item.projectTitle || this.getProjectTitle(item.projectId),
      _initials: this.getInitials(item)
    }));
  }

  private applyPage() {
    let filtered = [...this.allCandidatures];
    const search = this.searchTerm.trim().toLowerCase();

    if (search) {
      filtered = filtered.filter(candidature =>
        [
          candidature.nomCandidat,
          candidature.prenomCandidat,
          candidature.email,
          candidature.specialite,
          candidature._projectTitle
        ]
          .filter(Boolean)
          .some(value => String(value).toLowerCase().includes(search))
      );
    }

    const activeStatus = this.activeStatusFilters;
    if (activeStatus.length) {
      filtered = filtered.filter(candidature =>
        activeStatus.includes(this.normalizeStatus(candidature.statutCandidature))
      );
    }

    const activeScore = this.activeScoreFilters;
    if (activeScore.length) {
      filtered = filtered.filter(candidature => activeScore.some(band => this.isScoreInBand(candidature.scoreMatching, band)));
    }

    filtered = filtered.filter(candidature => {
      const score = candidature.scoreMatching ?? 0;
      return score >= this.scoreMin && score <= this.scoreMax;
    });

    this.totalItems = filtered.length;
    const start = this.pageIndex * this.pageSize;
    this.displayed = filtered.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  private isScoreInBand(score = 0, band: ScoreBand): boolean {
    if (band === 'excellent') return score >= 80;
    if (band === 'good') return score >= 65 && score < 80;
    if (band === 'average') return score >= 50 && score < 65;
    return score < 50;
  }

  private countByStatus(status: string): number {
    return this.allCandidatures.filter(c => this.normalizeStatus(c.statutCandidature) === status).length;
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
      NON_RETENU: 'Non retenu'
    };
    return map[upper] ?? raw;
  }

  private loadProjects(): void {
    this.projectService.getProjects({ status: 'open' }).subscribe({
      next: projects => {
        this.projects = projects?.length ? projects : this.fallbackProjects();
        this.setCandidatures(this.allCandidatures);
        this.openProjectApplicationFromRoute();
      },
      error: () => {
        this.projects = this.fallbackProjects();
        this.setCandidatures(this.allCandidatures);
        this.openProjectApplicationFromRoute();
      }
    });
  }

  private openProjectApplicationFromRoute(): void {
    const projectId = this.route.snapshot.queryParamMap.get('projectId') || history.state?.projectId;
    if (!projectId || this.showModal) return;

    const project = this.projects.find(item => item.id === projectId) ?? ({
      id: projectId,
      title: history.state?.workPostTitle || 'Projet selectionne',
      description: '',
      companyId: history.state?.companyId || '',
      companyName: history.state?.companyName || '',
      requiredSkills: [],
      teamSize: 1,
      deadline: new Date(),
      status: 'open',
      applicantsCount: 0,
      createdAt: new Date()
    } as Project);

    this.openCreate(project);
    this.cdr.detectChanges();
  }

  private fallbackProjects(): Project[] {
    return [
      {
        id: '1',
        title: 'Projet Développement Web',
        description: '',
        companyId: 'comp1',
        companyName: 'TechCorp',
        requiredSkills: ['Angular', 'TypeScript', 'Node.js'],
        teamSize: 5,
        deadline: new Date('2026-12-31'),
        status: 'open',
        applicantsCount: 12,
        createdAt: new Date('2026-01-01')
      },
      {
        id: '2',
        title: 'Projet IA & Machine Learning',
        description: '',
        companyId: 'comp2',
        companyName: 'AI Solutions',
        requiredSkills: ['Python', 'TensorFlow'],
        teamSize: 3,
        deadline: new Date('2026-11-30'),
        status: 'open',
        applicantsCount: 8,
        createdAt: new Date('2026-02-01')
      },
      {
        id: '3',
        title: 'Projet Mobile',
        description: '',
        companyId: 'comp3',
        companyName: 'MobileDev Inc',
        requiredSkills: ['React Native', 'Flutter'],
        teamSize: 4,
        deadline: new Date('2026-10-31'),
        status: 'open',
        applicantsCount: 15,
        createdAt: new Date('2026-03-01')
      }
    ];
  }
}
