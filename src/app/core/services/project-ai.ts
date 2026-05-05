import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiAnalysis {
  difficulty: string;
  summary: string;
  suggestedSkills: string[];
  recommendedTeamSize: number;
  estimatedDelay: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectAiService {

  private apiUrl = 'http://localhost:8080/api/ai/projects';

  constructor(private http: HttpClient) {}

  analyzeProject(projetId: string): Observable<AiAnalysis> {
    return this.http.get<AiAnalysis>(`${this.apiUrl}/analyze/${projetId}`);
  }
}
