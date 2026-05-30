import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { EntrepriseService, Entreprise } from '../../core/services/entreprise.service';

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

        this.stats = [
          {
            label: 'Entreprises',
            value: totalCompanies,
            icon: 'business',
            color: '#3B82F6',
            bg: '#EFF6FF'
          },
          {
            label: 'Secteurs',
            value: numberOfSectors,
            icon: 'category',
            color: '#10B981',
            bg: '#ECFDF5'
          }
        ];

        this.sectorBreakdown = Object.entries(sectorCounts).map(
          ([sector, count]) => ({
            sector,
            count
          })
        );

        setTimeout(() => this.createChart(), 0);
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.stats = [
          {
            label: 'Entreprises',
            value: 0,
            icon: 'business',
            color: '#3B82F6',
            bg: '#EFF6FF'
          },
          {
            label: 'Secteurs',
            value: 0,
            icon: 'category',
            color: '#10B981',
            bg: '#ECFDF5'
          }
        ];
        this.sectorBreakdown = [];

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
        this.loadStats();
        this.closeAddModal();
      },
      error: (err) => {
        console.error('Add failed', err);
        alert('Erreur lors de l ajout de l entreprise');
      }
    });
  }

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
        this.loadStats();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Update failed', err);
        alert('Erreur lors de la modification de l entreprise');
      }
    });
  }

  confirmDelete(company: Entreprise): void {
    this.selectedCompany = company;
    this.showDeleteConfirm = true;
  }

  deleteCompany(): void {
    if (!this.selectedCompany) return;

    this.entrepriseService.delete(this.selectedCompany.id).subscribe({
      next: () => {
        this.companies = this.companies.filter(
          (c) => c.id !== this.selectedCompany!.id
        );
        this.loadStats();
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
    const canvas = document.getElementById('sectorChart');
    if (!canvas) return;

    const labels = this.sectorBreakdown.map(s => s.sector);
    const data = this.sectorBreakdown.map(s => s.count);

    if (this.sectorChart) {
      this.sectorChart.destroy();
    }

    this.sectorChart = new Chart('sectorChart', {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Entreprises',
            data,
            borderWidth: 1,
            backgroundColor: '#E11D48',
            borderColor: '#BE123C'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
}
