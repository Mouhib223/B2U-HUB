import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CandidatureService } from '../../core/services/candidature.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'b2u-candidature-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './candidature-form.html',
  styleUrls: ['./candidature-form.scss']
})
export class CandidatureFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CandidatureService);
  private projectService = inject(ProjectService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);

  submitted = false;
  success = false;
  errorMessage = '';
  selectedProject?: Project;
  allProjects: Project[] = [];
  loadingProjects = false;

  readonly formations = ['Licence', 'Master', 'Ingenieur', 'Doctorat', 'BTS'];

  cvFile?: File;
  lettreFile?: File;
  cvError = '';
  lettreError = '';
  readonly MAX_SIZE = 5 * 1024 * 1024;

  form = this.fb.group({
    nomCandidat: ['', Validators.required],
    prenomCandidat: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    adresse: [''],
    formationActuelle: [''],
    specialite: [''],
    anneeExperience: [0, [Validators.required, Validators.min(0)]],
    projectId: ['', Validators.required],
    statutCandidature: ['En cours', Validators.required]
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId') || history.state?.projectId;
    const currentUser = this.auth.getCurrentUser();

    if (currentUser) {
      this.form.patchValue({
        email: currentUser.email ?? '',
        nomCandidat: currentUser.lastName ?? '',
        prenomCandidat: currentUser.firstName ?? ''
      });
    }

    if (projectId) {
      this.form.patchValue({ projectId });
      this.projectService.getProjectById(projectId).subscribe({
        next: project => { this.selectedProject = project; },
        error: () => { this.loadAllProjects(); }
      });
    } else {
      this.loadAllProjects();
    }
  }

  loadAllProjects() {
    this.loadingProjects = true;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.allProjects = projects.filter(p => p.status !== 'closed');
        this.loadingProjects = false;
      },
      error: () => { this.loadingProjects = false; }
    });
  }

  selectProject(projectId: string) {
    const project = this.allProjects.find(p => p.id === projectId);
    if (project) {
      this.selectedProject = project;
      this.form.patchValue({ projectId: project.id });
    }
  }

  onCvSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.cvError = '';
    this.cvFile = undefined;
    if (file) {
      const err = this.validatePdf(file);
      if (err) this.cvError = err;
      else this.cvFile = file;
    }
  }

  onLettreSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.lettreError = '';
    this.lettreFile = undefined;
    if (file) {
      const err = this.validatePdf(file);
      if (err) this.lettreError = err;
      else this.lettreFile = file;
    }
  }

  validatePdf(file: File): string | null {
    const type = (file.type || '').toLowerCase();
    if (!type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) return 'Le fichier doit etre un PDF';
    if (file.size > this.MAX_SIZE) return 'Taille maximale 5MB';
    return null;
  }

  submit() {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.selectedProject) {
      this.errorMessage = 'Veuillez selectionner un projet avant de soumettre.';
      return;
    }

    if (this.form.invalid) {
      this.errorMessage = 'Merci de remplir tous les champs obligatoires.';
      return;
    }

    if (this.cvFile && this.validatePdf(this.cvFile)) {
      this.cvError = this.validatePdf(this.cvFile)!;
      return;
    }
    if (this.lettreFile && this.validatePdf(this.lettreFile)) {
      this.lettreError = this.validatePdf(this.lettreFile)!;
      return;
    }

    const val = this.form.getRawValue();
    const dto = {
      nomCandidat: val.nomCandidat ?? '',
      prenomCandidat: val.prenomCandidat ?? '',
      email: val.email ?? '',
      telephone: val.telephone ?? '',
      adresse: val.adresse ?? '',
      formationActuelle: val.formationActuelle ?? '',
      specialite: val.specialite ?? '',
      anneeExperience: val.anneeExperience ?? 0,
      dateCandidature: new Date().toISOString().split('T')[0],
      projectId: val.projectId ?? '',
      projectTitle: this.selectedProject.title,
      projectType: this.selectedProject.type ?? 'PROJET',
      companyId: this.selectedProject.companyId ?? '',
      companyName: this.selectedProject.companyName ?? '',
      statutCandidature: 'En cours'
    };

    if (this.cvFile || this.lettreFile) {
const formData = new FormData();
formData.append('data', JSON.stringify(dto));
if (this.cvFile) formData.append('cv', this.cvFile);
if (this.lettreFile) formData.append('lettre', this.lettreFile);
this.service.createWithFiles(formData).subscribe({        next: () => { this.success = true; this.submitted = false; },
        error: err => { this.errorMessage = `Erreur (${err.status}): ${err.error?.message ?? 'Veuillez reessayer.'}`; }
      });
    } else {
      this.service.create(dto).subscribe({
        next: () => { this.success = true; this.submitted = false; },
        error: err => { this.errorMessage = `Erreur (${err.status}): ${err.error?.message ?? 'Veuillez reessayer.'}`; }
      });
    }
  }
}
