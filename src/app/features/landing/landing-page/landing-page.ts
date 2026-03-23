import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'b2u-landing-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing">
      <nav class="nav">
        <div class="nav-logo">B2U-HUB</div>
        <div class="nav-links">
          <a routerLink="/auth/login">Login</a>
          <a routerLink="/auth/register" class="btn-primary">Get Started</a>
        </div>
      </nav>
      <section class="hero">
        <h1>Connect Student Talent<br>with Real Projects</h1>
        <p>B2U-HUB brings companies and student freelancers together to build real-world solutions — powered by AI matching.</p>
        <div class="hero-btns">
          <a routerLink="/auth/register" class="btn-primary">Start as Student</a>
          <a routerLink="/auth/register" class="btn-outline">Post a Mission</a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing { min-height: 100vh; background: var(--color-bg); }
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 3rem; background: white; border-bottom: 1px solid var(--color-border); }
    .nav-logo { font-weight: 800; font-size: 1.25rem; color: var(--color-primary); }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    .nav-links a { color: var(--color-text); text-decoration: none; font-weight: 500; }
    .hero { text-align: center; padding: 6rem 2rem; }
    .hero h1 { font-size: 3rem; line-height: 1.2; color: var(--color-dark); margin-bottom: 1.5rem; }
    .hero p { font-size: 1.1rem; color: var(--color-muted); max-width: 600px; margin: 0 auto 2.5rem; }
    .hero-btns { display: flex; gap: 1rem; justify-content: center; }
    .btn-primary { background: var(--color-primary); color: white; padding: 0.75rem 1.75rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
    .btn-outline { border: 2px solid var(--color-primary); color: var(--color-primary); padding: 0.75rem 1.75rem; border-radius: 8px; font-weight: 600; text-decoration: none; }
  `]
})
export class LandingPageComponent {}