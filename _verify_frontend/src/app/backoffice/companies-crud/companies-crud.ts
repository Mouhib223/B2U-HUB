import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EntrepriseService, Entreprise } from '../../core/services/entreprise.service';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
Chart.register(...registerables);

@Component({
  selector: 'b2u-companies-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './companies-crud.html',
  styleUrls: ['./companies-crud.scss']
})
export class CompaniesCrudComponent implements OnInit {
  stats: any[] = [];
  sectorBreakdown: { sector: string; count: number }[] = [];
  companies: Entreprise[] = [];
  searchQuery = '';
  showDeleteConfirm = false;
  showAddModal = false;
  showEditModal = false;
  selectedCompany: Entreprise | null = null;
  editingCompany: Entreprise | null = null;
  equipesByCompany: { [key: string]: any[] } = {};
  expandedCompanyId: string | null = null;
  sectorChart: any;


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
    this.loadStats();
  }

  loadCompanies(): void {
    this.entrepriseService.getAll().subscribe({
      next: (data) => (this.companies = data),
      error: (err) => console.error('Failed to load companies', err)
    });
  }

  loadStats(): void {
  forkJoin({
    total: this.entrepriseService.getTotalCount(),
    sectors: this.entrepriseService.getCountBySector()
  }).subscribe({
    next: ({ total, sectors }) => {
      const totalCompanies = total?.total ?? 0;
      const sectorCounts = sectors ?? {};
      const numberOfSectors = Object.keys(sectorCounts).length;

      // ✅ Stats cards
      this.stats = [
        {
          label: 'Total',
          value: totalCompanies,
          icon: 'business',
          color: '#3B82F6',
          bg: '#EFF6FF'
        },
        {
          label: 'Sectors',
          value: numberOfSectors,
          icon: 'category',
          color: '#10B981',
          bg: '#ECFDF5'
        }
      ];

      // ✅ Transformer en tableau pour le chart
      this.sectorBreakdown = Object.entries(sectorCounts).map(
        ([sector, count]) => ({
          sector,
          count
        })
      );

      // ✅ Créer / refresh le graphique
      setTimeout(() => {
        this.createChart();
      }, 0);
    },

    error: (err) => {
      console.error('Failed to load stats', err);

      // fallback UI
      this.stats = [
        {
          label: 'Total',
          value: 0,
          icon: 'business',
          color: '#3B82F6',
          bg: '#EFF6FF'
        },
        {
          label: 'Sectors',
          value: 0,
          icon: 'category',
          color: '#10B981',
          bg: '#ECFDF5'
        }
      ];

      this.sectorBreakdown = [];

      // éviter crash du chart
      if (this.sectorChart) {
        this.sectorChart.destroy();
      }
    }
  });
}

  get filteredCompanies(): Entreprise[] {
    if (!this.searchQuery.trim()) return this.companies;
    const query = this.searchQuery.toLowerCase();
    return this.companies.filter(
      (c) =>
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
    this.entrepriseService.add(this.newCompany).subscribe({
      next: () => {
        this.loadCompanies();
        this.loadStats(); // refresh stats after add
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
        this.loadStats(); // refresh stats after update
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
          this.companies = this.companies.filter(
            (c) => c.id !== this.selectedCompany!.id
          );
          this.loadStats(); // refresh stats after delete
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

  toggleEquipes(companyId: string): void {
  if (this.expandedCompanyId === companyId) {
    this.expandedCompanyId = null;
    return;
  }

  this.expandedCompanyId = companyId;

  if (!this.equipesByCompany[companyId]) {
    this.entrepriseService.getEquipesByEntreprise(companyId).subscribe({
      next: (data) => {
        this.equipesByCompany[companyId] = data;
      },
      error: (err) => console.error('Failed to load equipes', err)
    });
  }
}

createChart(): void {
  const labels = this.sectorBreakdown.map(s => s.sector);
  const data = this.sectorBreakdown.map(s => s.count);

  if (this.sectorChart) {
    this.sectorChart.destroy(); // éviter duplication
  }

  this.sectorChart = new Chart('sectorChart', {
    type: 'bar', // tu peux changer en 'pie' ou 'doughnut'
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Companies',
          data: data,
          borderWidth: 1
        }
      ]
    },
    options: {
  responsive: true,
  maintainAspectRatio: false, // 🔥 IMPORTANT
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
}
  });
}
}