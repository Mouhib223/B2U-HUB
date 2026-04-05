import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EquipeService } from '../../core/services/equipe.service';

@Component({
  selector: 'b2u-equipe-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './equipe-crud.html',
  styleUrls: ['./equipe-crud.scss']
})
export class EquipeCrudComponent implements OnInit {

  equipes: any[] = [];
  searchQuery = '';

  submitted = false;
  submittedEdit = false;

  newEquipe = {
    nomMembresEquipe: '',
    descriptionProfil: '',
    status: 'active'
  };

  selectedEquipe: any = null;

  showAddModal = false;
  showEditModal = false;
  showDeleteConfirm = false;

  constructor(private equipeService: EquipeService) {}

  ngOnInit() {
    this.loadEquipes();
  }

  // ✅ LOAD
  loadEquipes() {
    this.equipeService.getAll().subscribe({
      next: (data: any) => {
        this.equipes = [...data]; // 🔥 important pour refresh
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // 🔍 FILTER
  get filteredEquipes() {
    return this.equipes.filter(e =>
      e.nomMembresEquipe?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // 🟢 ADD MODAL
  openAddModal() {
    this.showAddModal = true;
    this.submitted = false;
    this.newEquipe = { nomMembresEquipe: '', descriptionProfil: '', status: 'active' };
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  // 🟡 EDIT MODAL
  openEditModal(equipe: any) {
    this.selectedEquipe = { ...equipe };
    this.showEditModal = true;
    this.submittedEdit = false;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedEquipe = null;
  }

  // 🔵 ADD
  addEquipe() {
    this.submitted = true;

    if (!this.newEquipe.nomMembresEquipe.trim() || !this.newEquipe.descriptionProfil.trim()) {
      return;
    }

    this.equipeService.add(this.newEquipe).subscribe({
      next: (res: any) => {
        this.equipes.push(res); // 🔥 update direct
        this.closeAddModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // 🟣 UPDATE
  updateEquipe() {
    this.submittedEdit = true;

    if (!this.selectedEquipe.nomMembresEquipe.trim() || !this.selectedEquipe.descriptionProfil.trim()) {
      return;
    }

    this.equipeService.update(this.selectedEquipe).subscribe({
      next: (updated: any) => {
        const index = this.equipes.findIndex(e => e.idEquipe === updated.idEquipe);
        if (index !== -1) {
          this.equipes[index] = updated; // 🔥 update direct
        }
        this.closeEditModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // 🔴 DELETE MODAL
  confirmDelete(equipe: any) {
    this.selectedEquipe = equipe;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedEquipe = null;
  }

  // 🔴 DELETE
  deleteEquipeConfirmed() {
    const id = this.selectedEquipe.idEquipe;

    if (!id) return;

    this.equipeService.delete(id).subscribe({
      next: () => {
        this.equipes = this.equipes.filter(e => e.idEquipe !== id); // 🔥 remove direct
        this.cancelDelete();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}