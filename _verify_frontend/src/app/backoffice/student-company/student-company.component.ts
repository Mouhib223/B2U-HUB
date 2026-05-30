import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EntrepriseService, Entreprise } from '../../core/services/entreprise.service';

@Component({
  selector: 'b2u-student-company',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-company.component.html',
  styleUrls: ['./student-company.component.scss']
})
export class StudentCompanyComponent implements OnInit {
  companies: Entreprise[] = [];
  loading = false;
  similarCompanies: { [key: string]: Entreprise[] } = {};

  // Modal properties
  showSimilarModal = false;
  selectedCompanyName = '';
  selectedCompanyId = '';
  similarList: Entreprise[] = [];
  similarLoading = false;

  constructor(
    private entrepriseService: EntrepriseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.loading = true;
    this.entrepriseService.getAll().subscribe({
      next: (data) => {
        this.companies = data;

        // Preload similar companies for each company (optional)
        data.forEach(company => {
          this.loadSimilar(company.id);
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.loading = false;
      }
    });
  }

  loadSimilar(id: string) {
    this.entrepriseService.getSimilar(id).subscribe({
      next: (data) => {
        this.similarCompanies[id] = data;
      },
      error: (err) => {
        console.error('Failed to load similar companies', err);
      }
    });
  }

  // Open modal with similar companies
  openSimilarModal(company: Entreprise) {
    this.selectedCompanyId = company.id;
    this.selectedCompanyName = company.name;
    this.showSimilarModal = true;
    this.similarLoading = true;

    // Check if we already have cached similar companies
    if (this.similarCompanies[company.id]) {
      this.similarList = this.similarCompanies[company.id];
      this.similarLoading = false;
    } else {
      // Fetch similar companies if not cached
      this.entrepriseService.getSimilar(company.id).subscribe({
        next: (data) => {
          this.similarList = data;
          this.similarCompanies[company.id] = data; // Cache for future use
          this.similarLoading = false;
        },
        error: (err) => {
          console.error('Failed to load similar companies', err);
          this.similarList = [];
          this.similarLoading = false;
        }
      });
    }
  }

  closeSimilarModal() {
    this.showSimilarModal = false;
    this.similarList = [];
    this.selectedCompanyId = '';
    this.selectedCompanyName = '';
    this.similarLoading = false;
  }

  apply(company: Entreprise) {
    this.router.navigate(['/app/my-workpost', company.id], {
      state: { companyName: company.name }
    });
  }

  subject(company: Entreprise) {
    this.router.navigate(['/app/projects'], {
      state: { companyId: company.id, companyName: company.name }
    });
  }

  refreshData() {
    this.loadCompanies();
  }
}