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

  readonly statuts = ['En cours'];
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

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    const projectId = this.route.snapshot.queryParamMap.get('projectId') || history.state?.projectId;
    const currentUser = this.auth.getCurrentUser();

    if (currentUser?.email) {
      this.form.patchValue({ email: currentUser.email });
    }

    if (!projectId) {
      this.errorMessage = 'Choisissez un projet puis cliquez sur Postuler pour envoyer une candidature.';
      return;
    }

    this.form.patchValue({ projectId });
    this.projectService.getProjectById(projectId).subscribe({
      next: project => {
        this.selectedProject = project;
      },
      error: () => {
        this.errorMessage = 'Projet introuvable. Retournez a la liste des projets.';
      }
    });
  }

  onCvSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.cvError = '';
    this.cvFile = undefined;
    const err = this.validatePdf(file);
    if (err) this.cvError = err;
    else this.cvFile = file;
  }

  onLettreSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    this.lettreError = '';
    this.lettreFile = undefined;
    const err = this.validatePdf(file);
    if (err) this.lettreError = err;
    else this.lettreFile = file;
  }

  validatePdf(file?: File): string | null {
    if (!file) return 'Fichier requis';
    const name = file.name.toLowerCase();
    const type = (file.type || '').toLowerCase();
    if (!type.includes('pdf') && !name.endsWith('.pdf')) return 'Le fichier doit etre un PDF';
    if (file.size > this.MAX_SIZE) return 'Taille maximale 5MB';
    return null;
  }

  submit() {
    this.submitted = true;
    this.errorMessage = '';

    if (!this.selectedProject) {
      this.errorMessage = 'Selectionnez un projet depuis la page projets avant de postuler.';
      return;
    }

    if (this.form.invalid) {
      this.errorMessage = 'Merci de remplir tous les champs requis et de corriger les erreurs indiquees.';
      return;
    }

    this.cvError = this.validatePdf(this.cvFile) ?? '';
    this.lettreError = this.validatePdf(this.lettreFile) ?? '';
    if (this.cvError || this.lettreError) {
      this.errorMessage = 'Les pieces jointes doivent etre des PDF valides de moins de 5 Mo.';
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
      statutCandidature: 'En cours'
    };

    this.service.createWithFiles(dto, this.cvFile!, this.lettreFile!).subscribe({
      next: () => {
        this.success = true;
        this.submitted = false;
        this.cvFile = undefined;
        this.lettreFile = undefined;
        this.form.patchValue({ projectId: this.selectedProject?.id ?? '', statutCandidature: 'En cours' });
      },
      error: err => {
        this.errorMessage = `Erreur lors de l'envoi de la candidature (${err.status}): ${err.error?.message || err.message || 'Bad Request'}`;
      }
    });
  }
}
