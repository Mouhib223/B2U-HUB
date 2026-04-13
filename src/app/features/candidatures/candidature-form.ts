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

  submit() {
    this.submitted = true;
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    this.service.create({
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
    }).subscribe({
      next: () => {
        this.success = true;
        this.form.reset({ anneeExperience: 0, statutCandidature: 'En cours' });
        this.submitted = false;
      }
    });
  }
}
