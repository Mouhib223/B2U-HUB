import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CandidatureService } from '../../core/services/candidature.service';

@Component({
  selector: 'b2u-candidature-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidature-form.html',
  styleUrls: ['./candidature-form.scss']
})
export class CandidatureFormComponent {
  private fb = inject(FormBuilder);
  private service = inject(CandidatureService);

  submitted = false;
  success = false;

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
    statutCandidature: ['En cours', Validators.required],
    competences:       [''],
    cvLien:            [''],
    lettreMotivation:  ['']
  });

  get f() { return this.form.controls; }

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
    if (this.form.invalid) return;

    // validate files
    this.cvError = this.validatePdf(this.cvFile) ?? '';
    this.lettreError = this.validatePdf(this.lettreFile) ?? '';
    if (this.cvError || this.lettreError) return;

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
      statutCandidature: val.statutCandidature ?? 'En cours',
      competences:       val.competences ? val.competences.split(',').map((s: string) => s.trim()) : [],
      cvLien:            val.cvLien ?? '',
      lettreMotivation:  val.lettreMotivation ?? ''
    };

    // build FormData
    const fd = new FormData();
    const blob = new Blob([JSON.stringify(dto)], { type: 'application/json' });
    fd.append('data', blob);
    if (this.cvFile) fd.append('cv', this.cvFile);
    if (this.lettreFile) fd.append('lettre', this.lettreFile);

    this.service.createWithFiles(fd).subscribe({
      next: () => {
        this.success = true;
        this.form.reset({ anneeExperience: 0, statutCandidature: 'En cours' });
        this.submitted = false;
        this.cvFile = undefined; this.lettreFile = undefined;
      },
      error: (err) => {
        console.error('Upload error', err);
        // you can add user-facing error handling here
      }
    });
  }
}
