import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CandidatureService } from '../../core/services/candidature.service';
import { Candidature } from '../../core/models/candidature.model';

@Component({
  selector: 'b2u-company-candidatures',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './company-candidatures.component.html',
  styleUrls: ['./company-candidatures.component.scss']
})
export class CompanyCandidaturesComponent implements OnInit {
  private service = inject(CandidatureService);

  candidatures: Candidature[] = [];
  searchTerm = '';
  filterStatut = '';
  selected: Candidature | null = null;
  loading = false;

  get filtered(): Candidature[] {
    return this.candidatures.filter(c => {
      const matchSearch = `${c.nomCandidat} ${c.prenomCandidat} ${c.email} ${c.specialite}`
        .toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatut = this.filterStatut ? c.statutCandidature === this.filterStatut : true;
      return matchSearch && matchStatut;
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: data => { this.candidatures = data; this.loading = false; },
      error: () => { this.candidatures = []; this.loading = false; }
    });
  }

  accept(c: Candidature) {
    this.service.update(c.idCandidature!, { ...c, statutCandidature: 'Acceptée' }).subscribe({
      next: updated => {
        this.candidatures = this.candidatures.map(x =>
          x.idCandidature === updated.idCandidature ? updated : x
        );
        if (this.selected?.idCandidature === c.idCandidature) this.selected = updated;
      }
    });
  }

  reject(c: Candidature) {
    this.service.update(c.idCandidature!, { ...c, statutCandidature: 'Refusée' }).subscribe({
      next: updated => {
        this.candidatures = this.candidatures.map(x =>
          x.idCandidature === updated.idCandidature ? updated : x
        );
        if (this.selected?.idCandidature === c.idCandidature) this.selected = updated;
      }
    });
  }

  statusClass(s: string): string {
    return s === 'Acceptée' ? 'accepted' : s === 'Refusée' ? 'rejected' : 'pending';
  }

  get stats() {
    return {
      total:    this.candidatures.length,
      enCours:  this.candidatures.filter(c => c.statutCandidature === 'En cours').length,
      acceptes: this.candidatures.filter(c => c.statutCandidature === 'Acceptée').length,
      refuses:  this.candidatures.filter(c => c.statutCandidature === 'Refusée').length,
    };
  }
}
