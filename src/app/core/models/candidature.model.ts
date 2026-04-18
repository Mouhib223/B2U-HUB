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
}
