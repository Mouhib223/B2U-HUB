export interface Candidature {
  idCandidature?: string;
  nomCandidat: string;
  prenomCandidat: string;
  email: string;
  telephone: string;
  adresse?: string;
  formationActuelle?: string;
  specialite?: string;
  anneeExperience: number;
  dateCandidature?: string;
  statutCandidature: string;
  competences?: string[];
  cvLien?: string;
  lettreMotivation?: string;
  scoreMatching?: number;
  matchingDetails?: string;
  projectId?: string;
  // UI helper fields
  _initials?: string;
  _scorePercent?: number;
  _projectTitle?: string;
}

export interface CandidaturePage {
  content: Candidature[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
