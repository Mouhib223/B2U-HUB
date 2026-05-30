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

  cvFile: File | null = null;
  lettreFile: File | null = null;
  cvError: string | null = null;
  lettreError: string | null = null;

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
    this.showModal = true;
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
      specialite:        val.specialite ?? '',
      anneeExperience:   val.anneeExperience ?? 0,
      dateCandidature:   new Date().toISOString().split('T')[0],
      statutCandidature: 'En cours',
      competences:       val.competences ? val.competences.split(',').map((s: string) => s.trim()) : [],
      cvLien:            val.cvLien ?? '',
      lettreMotivation:  val.lettreMotivation ?? ''
    };

    this.service.create(dto).subscribe({
      next: (created) => {
        this.candidatures = [...this.candidatures, created];
        this.showModal = false;
        this.submitted = false;
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
