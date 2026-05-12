import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CandidatureService } from '../../core/services/candidature.service';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/project.model';

@Component({
  selector: 'b2u-candidature-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidature-form.html',
  styleUrls: ['./candidature-form.scss']
})
export class CandidatureFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(CandidatureService);
  private projectService = inject(ProjectService);

  submitted = false;
  success = false;
  errorMessage = '';

  projects: Project[] = [];

  readonly statuts = ['En cours', 'Acceptée', 'Refusée'];
  readonly formations = ['Licence', 'Master', 'Ingénieur', 'Doctorat', 'BTS'];

  // files
  cvFile?: File;
  lettreFile?: File;
  cvError = '';
  lettreError = '';
  readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

  form = this.fb.group({
    nomCandidat:       ['', Validators.required],
    prenomCandidat:    ['', Validators.required],
    email:             ['', [Validators.required, Validators.email]],
    telephone:         ['', Validators.required],
    adresse:           [''],
    formationActuelle: [''],
    specialite:        [''],
    anneeExperience:   [0, [Validators.required, Validators.min(0)]],
    projetId:          ['', Validators.required],
    statutCandidature: ['En cours', Validators.required]
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    this.loadProjects();
  }

  private loadProjects(): void {
    console.log('CandidatureForm: Loading projects...');
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        console.log('CandidatureForm: Projects loaded:', projects);
        this.projects = projects;
      },
      error: (error) => {
        console.error('CandidatureForm: Error loading projects:', error);
        this.projects = [];
        this.errorMessage = 'Impossible de charger la liste des projets. Vérifiez votre connexion.';
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
    if (!type.includes('pdf') && !name.endsWith('.pdf')) return 'Le fichier doit être un PDF';
    if (file.size > this.MAX_SIZE) return 'Taille maximale 5MB';
    return null;
  }

  submit() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      this.errorMessage = 'Merci de remplir tous les champs requis et de corriger les erreurs indiquées.';
      return;
    }

    // validate files
    this.cvError = this.validatePdf(this.cvFile) ?? '';
    this.lettreError = this.validatePdf(this.lettreFile) ?? '';
    if (this.cvError || this.lettreError) {
      this.errorMessage = 'Les pièces jointes doivent être des PDF valides de moins de 5 Mo.';
      return;
    }

    const val = this.form.getRawValue();
    const dto = {
      nomCandidat:       val.nomCandidat ?? '',
      prenomCandidat:    val.prenomCandidat ?? '',
      email:             val.email ?? '',
      telephone:         val.telephone ?? '',
      adresse:           val.adresse ?? '',
      formationActuelle: val.formationActuelle ?? '',
      specialite:        val.specialite ?? '',
      anneeExperience:   val.anneeExperience ?? 0,
      dateCandidature:   new Date().toISOString().split('T')[0],
      projectId:         val.projetId ?? '',
      statutCandidature: val.statutCandidature ?? 'En cours'
    };

    this.service.createWithFiles(dto, this.cvFile!, this.lettreFile!).subscribe({
      next: () => {
        this.success = true;
        this.form.reset({ anneeExperience: 0, projetId: '', statutCandidature: 'En cours' });
        this.submitted = false;
        this.cvFile = undefined; this.lettreFile = undefined;
      },
      error: (err) => {
        console.error('Upload error', err);
        this.errorMessage = `Erreur lors de l'envoi de la candidature (${err.status}): ${err.error?.message || err.message || 'Bad Request'}`;
      }
    });
  }
}
