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
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.loading = false;
      }
    });
  }

  apply(company: Entreprise) {
    // Navigate to new-candidature page, optionally pass company ID via state or query params
    this.router.navigate(['/app/candidatures'], {
      state: { companyId: company.id, companyName: company.name }
    });
    // Or use queryParams: this.router.navigate(['/student/new-candidature'], { queryParams: { companyId: company.id } });
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