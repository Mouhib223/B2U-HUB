import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CandidatureService } from '../../core/services/candidature.service';
import { AuthService } from '../../core/services/auth.service';
import { Candidature } from '../../core/models/candidature.model';

@Component({
  selector: 'b2u-student-candidatures',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './student-candidatures.component.html',
  styleUrls: ['./student-candidatures.component.scss']
})
export class StudentCandidaturesComponent implements OnInit {
  private service = inject(CandidatureService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  candidatures: Candidature[] = [];
  showModal = false;
  submitted = false;
  loading = false;

  readonly formations = ['Licence', 'Master', 'Ingénieur', 'Doctorat', 'BTS'];

  form = this.fb.group({
    nomCandidat:       ['', Validators.required],
    prenomCandidat:    ['', Validators.required],
    telephone:         ['', Validators.required],
    adresse:           [''],
    formationActuelle: [''],
    specialite:        [''],
    anneeExperience:   [0, Validators.min(0)],
    competences:       [''],
    cvLien:            [''],
    lettreMotivation:  ['']
  });

  get f() { return this.form.controls; }

  ngOnInit() { this.load(); }

  load() {
    const email = this.auth.getCurrentUser()?.email;
    if (!email) return;
    this.loading = true;
    this.service.getByEmail(email).subscribe({
      next: data => { this.candidatures = data; this.loading = false; },
      error: () => { this.candidatures = []; this.loading = false; }
    });
  }

  openCreate() {
    this.form.reset({ anneeExperience: 0 });
    this.submitted = false;
    this.showModal = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const userEmail = this.auth.getCurrentUser()?.email ?? '';
    const dto: Candidature = {
      nomCandidat:       val.nomCandidat ?? '',
      prenomCandidat:    val.prenomCandidat ?? '',
      email:             userEmail,
      telephone:         val.telephone ?? '',
      adresse:           val.adresse ?? '',
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

  statusClass(s: string): string {
    return s === 'Acceptée' ? 'accepted' : s === 'Refusée' ? 'rejected' : 'pending';
  }
}
