import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'b2u-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile implements OnInit {
  private auth    = inject(AuthService);
  private profile = inject(ProfileService);
  private router  = inject(Router);

  user = this.auth.getCurrentUser();
  loading  = false;
  success  = false;
  errorMsg = '';

  // Base fields (all roles)
  base = { firstName: '', lastName: '', password: '', confirmPassword: '' };

  // Student extended fields
  student = {
    bio: '', phone: '', university: '', graduationYear: '',
    specialite: '', linkedin: '', github: '', skillsStr: ''
  };

  // Company extended fields
  company = { name: '', description: '', sector: '', address: '', phone: '' };

  ngOnInit() {
    if (!this.user) return;
    this.base.firstName = this.user.firstName;
    this.base.lastName  = this.user.lastName;

    if (this.user.role === 'student') {
      this.profile.getMyStudentProfile().subscribe({
        next: (p) => {
          this.student.bio            = p.bio || '';
          this.student.phone          = p.phone || '';
          this.student.university     = p.university || '';
          this.student.graduationYear = p.graduationYear || '';
          this.student.specialite     = p.specialite || '';
          this.student.linkedin       = p.linkedin || '';
          this.student.github         = p.github || '';
          this.student.skillsStr      = (p.skills || []).join(', ');
        }
      });
    }

    if (this.user.role === 'company') {
      this.profile.getMyCompanyProfile().subscribe({
        next: (c) => {
          this.company.name        = c.name || '';
          this.company.description = c.description || '';
          this.company.sector      = c.sector || '';
          this.company.address     = c.address || '';
          this.company.phone       = c.phone || '';
        }
      });
    }
  }

  save() {
    this.errorMsg = '';
    if (this.base.password && this.base.password !== this.base.confirmPassword) {
      this.errorMsg = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;

    const basePayload: any = {
      firstName: this.base.firstName,
      lastName:  this.base.lastName
    };
    if (this.base.password) basePayload.password = this.base.password;

    this.profile.updateMyUserBase(basePayload).subscribe({
      next: () => {
        this.auth.updateCurrentUser({
          firstName: this.base.firstName,
          lastName:  this.base.lastName
        });
        if (this.user!.role === 'student') this.saveStudent();
        else if (this.user!.role === 'company') this.saveCompany();
        else this.onSuccess();
      },
      error: (e) => { this.loading = false; this.errorMsg = e.error?.message || 'Erreur'; }
    });
  }

  private saveStudent() {
    const skills = this.student.skillsStr
      .split(',').map(s => s.trim()).filter(s => s.length > 0);

    this.profile.updateMyStudentProfile({
      bio: this.student.bio,
      phone: this.student.phone,
      university: this.student.university,
      graduationYear: this.student.graduationYear,
      specialite: this.student.specialite,
      linkedin: this.student.linkedin,
      github: this.student.github,
      skills
    }).subscribe({ next: () => this.onSuccess(), error: () => this.onSuccess() });
  }

  private saveCompany() {
    this.profile.updateMyCompanyProfile(this.company)
      .subscribe({ next: () => this.onSuccess(), error: () => this.onSuccess() });
  }

  private onSuccess() {
    this.loading = false;
    this.success = true;
    setTimeout(() => this.router.navigate(['/app/profile']), 1500);
  }
}
