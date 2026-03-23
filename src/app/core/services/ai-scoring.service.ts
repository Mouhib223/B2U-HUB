import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AIScore } from '../models/score.model';
import { environment } from '../../../environments/environment';

const MOCK_SCORE: AIScore = {
  userId: 'demo',
  overallScore: 78,
  rank: 'Gold',
  skillScores: [
    { category: 'Technical Skills',   score: 85, weight: 0.4 },
    { category: 'Communication',      score: 72, weight: 0.2 },
    { category: 'Project Experience', score: 68, weight: 0.25 },
    { category: 'Problem Solving',    score: 80, weight: 0.15 },
  ],
  strengths: ['React.js', 'Python', 'API Integration'],
  improvements: ['Docker', 'System Design', 'Public Speaking'],
  recommendations: [
    'Complete 2 more projects to boost your experience score',
    'Add Docker to your skillset — 60% of projects require it',
    'Fill all profile sections for a +5 bonus score',
  ],
  lastUpdated: new Date(),
};

@Injectable({ providedIn: 'root' })
export class AIScoringService {
  private api = `${environment.apiUrl}/scoring`;

  constructor(private http: HttpClient) {}

  getMyScore(): Observable<AIScore> {
    return this.http.get<AIScore>(`${this.api}/me`).pipe(
      catchError(() => of(MOCK_SCORE))
    );
  }

  getMatchScore(projectId: string): Observable<{ match: number; reasons: string[] }> {
    return this.http.get<any>(`${this.api}/match/${projectId}`).pipe(
      catchError(() => of({ match: 72, reasons: ['Skills match 5/7', 'Availability matches'] }))
    );
  }
}