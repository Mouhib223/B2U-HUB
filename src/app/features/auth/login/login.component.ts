import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'b2u-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /*submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }*/
  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: () => {
        const user = this.auth.getCurrentUser();
        if (user?.role === 'admin') this.router.navigate(['/admin/dashboard']);
        else if (user?.role === 'company') this.router.navigate(['/company/dashboard']);
        else this.router.navigate(['/app/dashboard']);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Email ou mot de passe incorrect.';
        this.loading = false;
      }
    });
  }
}
