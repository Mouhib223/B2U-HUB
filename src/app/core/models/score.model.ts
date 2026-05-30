// Kept for backward compatibility — actual data now comes from evaluation.model.ts
export interface SkillScore {
  category: string;
  score: number;
  weight: number;
}

export interface AIScore {
  idEval?: string;
  idEtudiant?: string;
  nomEtudiant?: string;
  overallScore: number;
  rank: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  skillScores: SkillScore[];
  technicalSkills?: number;
  communication?: number;
  projectExperience?: number;
  problemSolving?: number;
  teamwork?: number;
  punctuality?: number;
  creativity?: number;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  status?: string;
  createdAt?: string;
}