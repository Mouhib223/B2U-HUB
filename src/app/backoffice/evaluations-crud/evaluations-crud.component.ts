import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EvaluationService } from '../../core/services/evaluation.service';
import { AIScoringService } from '../../core/services/ai-scoring.service';
import { Evaluation } from '../../core/models/evaluation.model';

@Component({
  selector: 'b2u-evaluations-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './evaluations-crud.component.html',
  styleUrls: ['./evaluations-crud.component.scss']
})
export class EvaluationsCrudComponent implements OnInit {
  evaluations: Evaluation[] = [];
  loading = false;
  searchQuery = '';
  filterRank = 'all';
  platformStats: any = null;
  showDeleteConfirm = false;
  selectedEval: Evaluation | null = null;

  constructor(
    private evalService: EvaluationService,
    private scoringService: AIScoringService
  ) {}

  ngOnInit() {
    this.load();
    this.scoringService.getPlatformStats().subscribe(s => this.platformStats = s);
  }

  load() {
    this.loading = true;
    this.evalService.getAll().subscribe({
      next: data => { this.evaluations = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): Evaluation[] {
    return this.evaluations.filter(e => {
      const matchSearch = !this.searchQuery ||
        (e.nomEtudiant ?? '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (e.nomProjet ?? '').toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRank = this.filterRank === 'all' || e.rank === this.filterRank;
      return matchSearch && matchRank;
    });
  }

  validate(eval_: Evaluation) {
    if (!eval_.idEval) return;
    this.evalService.validate(eval_.idEval).subscribe(() => this.load());
  }

  confirmDelete(eval_: Evaluation) {
    this.selectedEval = eval_;
    this.showDeleteConfirm = true;
  }

  deleteEval() {
    if (!this.selectedEval?.idEval) return;
    this.evalService.delete(this.selectedEval.idEval).subscribe(() => {
      this.evaluations = this.evaluations.filter(e => e.idEval !== this.selectedEval!.idEval);
      this.showDeleteConfirm = false;
      this.selectedEval = null;
    });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedEval = null;
  }

  getRankColor(rank?: string): string {
    return { BRONZE:'#CD7F32', SILVER:'#9CA3AF', GOLD:'#F59E0B', PLATINUM:'#6366F1' }[rank ?? ''] ?? '#9CA3AF';
  }

  getRankBg(rank?: string): string {
    return { BRONZE:'#FDF3E7', SILVER:'#F3F4F6', GOLD:'#FFFBEB', PLATINUM:'#EEF2FF' }[rank ?? ''] ?? '#F3F4F6';
  }
}