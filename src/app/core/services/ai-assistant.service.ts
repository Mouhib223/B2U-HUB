import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProjectGenerationResult {
  description: string;
  requiredSkills: string[];
}

export interface SkillGapResult {
  missingSkills: string[];
  matchedSkills: string[];
  advice: string;
  matchPercent: number;
}

@Injectable({ providedIn: 'root' })
export class AiAssistantService {
  constructor(private http: HttpClient) {}

  generateProjectDescription(title: string, sector: string): Observable<ProjectGenerationResult> {
    return this.http.post<ProjectGenerationResult>('/api/ai/generate-project', { title, sector });
  }

  analyzeSkillGap(projectId: string): Observable<SkillGapResult> {
    return this.http.post<SkillGapResult>('/api/ai/skill-gap', { projectId });
  }

  generateCandidatureFeedback(candidatureId: string): Observable<{ feedback: string }> {
    return this.http.post<{ feedback: string }>(`/api/ai/candidature-feedback/${candidatureId}`, {});
  }
}
