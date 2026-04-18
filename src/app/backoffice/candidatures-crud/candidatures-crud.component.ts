import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CandidatureService } from '../../core/services/candidature.service';
import { Candidature } from '../../core/models/candidature.model';

@Component({
  selector: 'b2u-candidatures-crud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule],
  templateUrl: './candidatures-crud.component.html',
  styleUrls: ['./candidatures-crud.component.scss']
})
export class CandidaturesCrudComponent implements OnInit {
  private service = inject(CandidatureService);
  private fb = inject(FormBuilder);

  candidatures: Candidature[] = [];
  showModal = false;
  editingId: string | null = null;
  submitted = false;
  searchTerm = '';
  loading = false;

  readonly statuts = ['En cours', 'Acceptée', 'Refusée'];

  form = this.fb.group({
    nomCandidat:       ['', Validators.required],
    prenomCandidat:    ['', Validators.required],
    email:             ['', [Validators.required, Validators.email]],
    telephone:         ['', Validators.required],
    adresse:           [''],
    formationActuelle: [''],
    specialite:        [''],
    anneeExperience:   [0, Validators.min(0)],
    statutCandidature: ['En cours', Validators.required],
    competences:       [''],
    cvLien:            [''],
    lettreMotivation:  ['']
  });

  get f() { return this.form.controls; }

  get filtered(): Candidature[] {
    const t = this.searchTerm.toLowerCase();
    return this.candidatures.filter(c =>
      `${c.nomCandidat} ${c.prenomCandidat} ${c.email}`.toLowerCase().includes(t)
    );
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => { this.candidatures = data; this.loading = false; },
      error: () => { this.candidatures = []; this.loading = false; }
    });
  }

  openCreate() {
    this.editingId = null;
    this.form.reset({ anneeExperience: 0, statutCandidature: 'En cours' });
    this.submitted = false;
    this.showModal = true;
  }

  openEdit(c: Candidature) {
    this.editingId = c.idCandidature!;
    this.form.patchValue({ ...c, competences: c.competences?.join(', ') ?? '' });
    this.submitted = false;
    this.showModal = true;
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const dto: Candidature = {
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

    const op = this.editingId
      ? this.service.update(this.editingId, dto)
      : this.service.create(dto);

    op.subscribe({
      next: (result) => {
        if (this.editingId) {
          this.candidatures = this.candidatures.map(x =>
            x.idCandidature === result.idCandidature ? result : x
          );
        } else {
          this.candidatures = [...this.candidatures, result];
        }
        this.showModal = false;
      }
    });
  }

  delete(id: string) {
    if (!confirm('Supprimer cette candidature ?')) return;
    this.service.delete(id).subscribe({
      next: () => {
        this.candidatures = this.candidatures.filter(c => c.idCandidature !== id);
      }
    });
  }

  statusClass(s: string): string {
    return s === 'Acceptée' ? 'accepted' : s === 'Refusée' ? 'rejected' : 'pending';
  }
}
