import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EntrepriseService, Entreprise } from '../../core/services/entreprise.service';

@Component({
  selector: 'b2u-companies-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './companies-crud.html',
  styleUrls: ['./companies-crud.scss']
})
export class CompaniesCrudComponent implements OnInit {

  companies: Entreprise[] = [];
  searchQuery = '';
  showDeleteConfirm = false;
  showAddModal = false;
  showEditModal = false;          // ✅ new flag for edit modal
  selectedCompany: Entreprise | null = null;
  editingCompany: Entreprise | null = null; // ✅ company being edited

  newCompany = {
    name: '',
    email: '',
    phone: '',
    address: '',
    sector: ''
  };

  constructor(private entrepriseService: EntrepriseService) {}

  ngOnInit(): void {
    this.loadCompanies();
  }

  loadCompanies(): void {
    this.entrepriseService.getAll().subscribe({
      next: (data) => {
        this.companies = data;
      },
      error: (err) => {
        console.error('Failed to load companies', err);
      }
    });
  }

  get filteredCompanies(): Entreprise[] {
    if (!this.searchQuery.trim()) return this.companies;
    const query = this.searchQuery.toLowerCase();
    return this.companies.filter(c =>
      c.name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  }

  // --- ADD ---
  openAddModal(): void {
    this.newCompany = { name: '', email: '', phone: '', address: '', sector: '' };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addCompany(): void {
  // Les validations sont déjà assurées par le formulaire template-driven
  this.entrepriseService.add(this.newCompany).subscribe({
    next: () => {
      this.loadCompanies();
      this.closeAddModal();
    },
    error: (err) => {
      console.error('Add failed', err);
      alert('Failed to add company');
    }
  });
}

  // --- EDIT ---
  openEditModal(company: Entreprise): void {
    // Create a copy to avoid mutating the original while editing
    this.editingCompany = { ...company };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingCompany = null;
  }

  updateCompany(): void {
  if (!this.editingCompany) return;
  this.entrepriseService.update(this.editingCompany.id, this.editingCompany).subscribe({
    next: () => {
      this.loadCompanies();
      this.closeEditModal();
    },
    error: (err) => {
      console.error('Update failed', err);
      alert('Failed to update company');
    }
  });
}

  // --- DELETE ---
  confirmDelete(company: Entreprise): void {
    this.selectedCompany = company;
    this.showDeleteConfirm = true;
  }

  deleteCompany(): void {
    if (this.selectedCompany) {
      this.entrepriseService.delete(this.selectedCompany.id).subscribe({
        next: () => {
          this.companies = this.companies.filter(c => c.id !== this.selectedCompany!.id);
          this.showDeleteConfirm = false;
          this.selectedCompany = null;
        },
        error: (err) => {
          console.error('Delete failed', err);
          this.showDeleteConfirm = false;
          this.selectedCompany = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.selectedCompany = null;
  }

  // Mock data: companies with projects
companyProjects = [
  {
    companyName: 'TechCorp Tunisia',
    projects: [
      { name: 'Mobile App Development', team: ['Ali Ben Salah', 'Sarra Mansour'] },
      { name: 'Cloud Migration', team: ['Mohamed Amine', 'Nour Jebali'] }
    ]
  },
  {
    companyName: 'StartupHub',
    projects: [
      { name: 'E-commerce Platform', team: ['Kais Ben Ahmed', 'Lina Ghorbel'] }
    ]
  },
  {
    companyName: 'DigitalSoft',
    projects: [
      { name: 'CRM Implementation', team: ['Oussema Hammami', 'Yosra Mhiri'] },
      { name: 'Data Analytics Dashboard', team: ['Amine Bouali', 'Sirine Chebbi'] }
    ]
  }
];

// Flattened project list for easy display
allProjectsWithTeam = [
  { company: 'TechCorp Tunisia', project: 'Mobile App Development', team: 'Ali Ben Salah, Sarra Mansour' },
  { company: 'TechCorp Tunisia', project: 'Cloud Migration', team: 'Mohamed Amine, Nour Jebali' },
  { company: 'StartupHub', project: 'E-commerce Platform', team: 'Kais Ben Ahmed, Lina Ghorbel' },
  { company: 'DigitalSoft', project: 'CRM Implementation', team: 'Oussema Hammami, Yosra Mhiri' },
  { company: 'DigitalSoft', project: 'Data Analytics Dashboard', team: 'Amine Bouali, Sirine Chebbi' }
];
}