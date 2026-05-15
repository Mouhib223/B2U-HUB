import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EquipeAiService {

  // ✅ Passe par ton backend Spring Boot
  private apiUrl = 'http://localhost:8080/equipe/ai/chat';

  constructor(private http: HttpClient) {}

  chat(userMessage: string, equipes: any[], userSkills: string[]): Observable<string> {
    const systemPrompt = `Tu es un assistant IA intégré dans une plateforme B2U (étudiants/freelancers).
Tu aides les étudiants à trouver l'équipe la plus compatible avec leur profil.
Réponds toujours en français, de façon concise et utile (max 3-4 phrases).
Quand tu mentionnes une équipe, mets son nom en gras avec **.`;

    const contextPrompt = `
Équipes disponibles sur la plateforme :
${equipes.map(e => `- ${e.nomMembresEquipe || 'Équipe'} : ${e.descriptionProfil || 'N/A'} (status: ${e.status || 'N/A'})`).join('\n')}

Compétences de l'étudiant : ${userSkills.length > 0 ? userSkills.join(', ') : 'non renseignées'}

Question : ${userMessage}
`;

    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: contextPrompt }]
    };

    // ✅ Headers simplifiés — la clé API est dans le backend
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        // ✅ Le backend retourne une string JSON — on la parse
        const parsed = typeof res === 'string' ? JSON.parse(res) : res;
        return parsed?.content?.[0]?.text ?? 'Je n\'ai pas pu générer une réponse.';
      })
    );
  }

  computeMatchScore(equipe: any, userSkills: string[]): number {
    if (!userSkills || userSkills.length === 0) return Math.floor(Math.random() * 40 + 40);
    const description = (equipe.descriptionProfil || equipe.nomMembresEquipe || '').toLowerCase();
    const matches = userSkills.filter(skill =>
      description.includes(skill.toLowerCase())
    ).length;
    const base = Math.round((matches / Math.max(userSkills.length, 1)) * 60);
    return Math.min(base + 30 + Math.floor(Math.random() * 10), 99);
  }
}