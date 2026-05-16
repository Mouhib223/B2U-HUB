/*import { Injectable } from '@angular/core';
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
}*/import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Evaluation } from '../models/evaluation.model';
import { AIScore } from '../models/score.model';

// Mock fallback — used when backend is not running
const MOCK_SCORE: AIScore = {
  idEval: 'mock-001',
  idEtudiant: '1',
  nomEtudiant: 'Ali Student',
  overallScore: 78,
  rank: 'GOLD',
  technicalSkills: 85,
  communication: 72,
  projectExperience: 68,
  problemSolving: 80,
  teamwork: 75,
  punctuality: 70,
  creativity: 65,
  skillScores: [
    { category: 'Technical Skills',   score: 85, weight: 0.25 },
    { category: 'Communication',      score: 72, weight: 0.15 },
    { category: 'Project Experience', score: 68, weight: 0.20 },
    { category: 'Problem Solving',    score: 80, weight: 0.15 },
    { category: 'Teamwork',           score: 75, weight: 0.10 },
    { category: 'Punctuality',        score: 70, weight: 0.10 },
    { category: 'Creativity',         score: 65, weight: 0.05 },
  ],
  strengths: ['Strong technical foundation', 'Excellent problem-solving skills'],
  improvements: ['Creativity (65/100)', 'Project Experience (68/100)', 'Communication (72/100)'],
  recommendations: [
    'Complete 2 more real-world projects to boost experience score',
    'Add Docker to your skillset — 60% of projects require it',
    'Fill all profile sections for a +5 bonus score',
  ],
  status: 'VALIDATED',
};

@Injectable({ providedIn: 'root' })
export class AIScoringService {
  private api = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  // Maps backend Evaluation to AIScore format
  private toAIScore(e: Evaluation): AIScore {
    return {
      idEval: e.idEval,
      idEtudiant: e.idEtudiant,
      nomEtudiant: e.nomEtudiant,
      overallScore: e.overallScore ?? 0,
      rank: e.rank ?? 'BRONZE',
      technicalSkills:   e.technicalSkills,
      communication:     e.communication,
      projectExperience: e.projectExperience,
      problemSolving:    e.problemSolving,
      teamwork:          e.teamwork,
      punctuality:       e.punctuality,
      creativity:        e.creativity,
      skillScores: [
        { category: 'Technical Skills',   score: e.technicalSkills,   weight: 0.25 },
        { category: 'Communication',      score: e.communication,      weight: 0.15 },
        { category: 'Project Experience', score: e.projectExperience,  weight: 0.20 },
        { category: 'Problem Solving',    score: e.problemSolving,     weight: 0.15 },
        { category: 'Teamwork',           score: e.teamwork,           weight: 0.10 },
        { category: 'Punctuality',        score: e.punctuality,        weight: 0.10 },
        { category: 'Creativity',         score: e.creativity,         weight: 0.05 },
      ],
      strengths:       e.strengths ?? [],
      improvements:    e.improvements ?? [],
      recommendations: e.recommendations ?? [],
      status:  e.status,
      createdAt: e.createdAt,
    };
  }

  // ── Used by scoring-dashboard ──
  getLatestScore(studentId: string): Observable<AIScore> {
    return this.http.get<Evaluation>(
      `${this.api}/student/${studentId}/latest`
    ).pipe(
      map(e => this.toAIScore(e)),
      catchError(() => of({
        ...MOCK_SCORE,
        idEtudiant: studentId,
        nomEtudiant: 'Current Student'
      }))
    );
  }

  getStudentStats(studentId: string): Observable<any> {
    return this.http.get<any>(
      `${this.api}/student/${studentId}/stats`
    ).pipe(
      catchError(() => of({ totalEvaluations: 3, averageScore: 75, bestScore: 82 }))
    );
  }

  getScoreEvolution(studentId: string): Observable<AIScore[]> {
    return this.http.get<Evaluation[]>(
      `${this.api}/student/${studentId}/evolution`
    ).pipe(
      map(list => list.map(e => this.toAIScore(e))),
      catchError(() => of([
        { ...MOCK_SCORE, overallScore: 54, rank: 'SILVER' as const, createdAt: '2025-01-15T00:00:00', skillScores: [] },
        { ...MOCK_SCORE, overallScore: 62, rank: 'SILVER' as const, createdAt: '2025-02-10T00:00:00', skillScores: [] },
        { ...MOCK_SCORE, overallScore: 70, rank: 'GOLD'   as const, createdAt: '2025-03-05T00:00:00', skillScores: [] },
        { ...MOCK_SCORE, overallScore: 78, rank: 'GOLD'   as const, createdAt: '2025-04-01T00:00:00', skillScores: [] },
      ]))
    );
  }

  getLeaderboard(top = 5): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.api}/leaderboard?top=${top}`
    ).pipe(
      catchError(() => of([
        { nomEtudiant: 'Sarra M.',   overallScore: 91, rank: 'PLATINUM', nomProjet: 'AI Pipeline' },
        { nomEtudiant: 'Youssef T.', overallScore: 88, rank: 'PLATINUM', nomProjet: 'React App'   },
        { nomEtudiant: 'Ali B.',     overallScore: 78, rank: 'GOLD',     nomProjet: 'B2U Feature'  },
        { nomEtudiant: 'Mariem K.',  overallScore: 74, rank: 'GOLD',     nomProjet: 'Mobile App'   },
        { nomEtudiant: 'Amine R.',   overallScore: 65, rank: 'SILVER',   nomProjet: 'Data Task'    },
      ]))
    );
  }

  getRadarData(studentId: string): Observable<any> {
    return this.http.get<any>(
      `${this.api}/student/${studentId}/radar`
    ).pipe(
      catchError(() => of({
        labels: ['Technical','Communication','Problem Solving','Project Exp.','Teamwork','Punctuality','Creativity'],
        scores: [85, 72, 80, 68, 75, 70, 65]
      }))
    );
  }

  getStudentDashboard(studentId: string): Observable<any> {
    return this.http.get<any>(
      `${this.api}/dashboard/student/${studentId}`
    ).pipe(
      catchError(() => of(null))
    );
  }

  getAiFeedback(evalId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${evalId}/ai-feedback`).pipe(
      catchError(() => of({ professionalSummary: 'AI feedback unavailable', detailedFeedback: '', careerAdvice: '', interviewQuestions: '' }))
    );
  }

  getLearningPath(evalId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${evalId}/learning-path`).pipe(
      catchError(() => of(null))
    );
  }

  getInterviewQuestions(evalId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/${evalId}/interview-questions`).pipe(
      catchError(() => of([]))
    );
  }

  // ── Admin dashboard ──
  getAdminDashboard(): Observable<any> {
    return this.http.get<any>(`${this.api}/dashboard/admin`).pipe(
      catchError(() => of(null))
    );
  }

  getPlatformStats(): Observable<any> {
    return this.http.get<any>(`${this.api}/stats/platform`).pipe(
      catchError(() => of({ totalEvaluations: 0, averageScore: 0 }))
    );
  }
}