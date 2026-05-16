export type EvaluationType = 'PROFILE' | 'PROJECT';
export type ScoreRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type EvaluationStatus = 'DRAFT' | 'SUBMITTED' | 'VALIDATED';

export interface SkillScore {
  category: string;
  score: number;
  weight: number;
}

export interface Evaluation {
  idEval?: string;
  idEtudiant: string;
  nomEtudiant?: string;
  idProjet?: string;
  nomProjet?: string;
  idEntreprise?: string;
  nomEntreprise?: string;
  idEquipe?: string;
  nomEquipe?: string;
  idCandidature?: string;
  type: EvaluationType;
  technicalSkills: number;
  communication: number;
  projectExperience: number;
  problemSolving: number;
  teamwork: number;
  punctuality: number;
  creativity: number;
  overallScore?: number;
  rank?: ScoreRank;
  commentaire?: string;
  recommendations?: string[];
  strengths?: string[];
  improvements?: string[];
  status?: EvaluationStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Used by the AI Score page (maps backend fields)
export interface AIScore {
  idEval: string;
  idEtudiant: string;
  nomEtudiant: string;
  overallScore: number;
  rank: ScoreRank;
  technicalSkills: number;
  communication: number;
  projectExperience: number;
  problemSolving: number;
  teamwork: number;
  punctuality: number;
  creativity: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  status: EvaluationStatus;
  createdAt?: string;
  // Adapter fields for the old score.model format
  get skillScores(): SkillScore[];
}

// Adapter function to add skillScores getter
export function toAIScore(e: Evaluation): AIScore {
  return {
    idEval: e.idEval ?? '',
    idEtudiant: e.idEtudiant,
    nomEtudiant: e.nomEtudiant ?? '',
    overallScore: e.overallScore ?? 0,
    rank: e.rank ?? 'BRONZE',
    technicalSkills: e.technicalSkills,
    communication: e.communication,
    projectExperience: e.projectExperience,
    problemSolving: e.problemSolving,
    teamwork: e.teamwork,
    punctuality: e.punctuality,
    creativity: e.creativity,
    strengths: e.strengths ?? [],
    improvements: e.improvements ?? [],
    recommendations: e.recommendations ?? [],
    status: e.status ?? 'SUBMITTED',
    createdAt: e.createdAt,
    get skillScores(): SkillScore[] {
      return [
        { category: 'Technical Skills',    score: e.technicalSkills,   weight: 0.25 },
        { category: 'Communication',       score: e.communication,      weight: 0.15 },
        { category: 'Project Experience',  score: e.projectExperience,  weight: 0.20 },
        { category: 'Problem Solving',     score: e.problemSolving,     weight: 0.15 },
        { category: 'Teamwork',            score: e.teamwork,           weight: 0.10 },
        { category: 'Punctuality',         score: e.punctuality,        weight: 0.10 },
        { category: 'Creativity',          score: e.creativity,         weight: 0.05 },
      ];
    }
  };
}