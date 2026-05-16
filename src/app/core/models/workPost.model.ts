export type WorkPostStatus = 'ACTIVE' | 'FILLED' | 'EXPIRED' | 'CLOSED';
export type WorkMode = 'HYBRID' | 'REMOTE' | 'ONSITE';

export interface WorkPost {
  id?: string;
  entrepriseId?: string;
  title: string;
  hoursPerWeek: number;
  requiredSkills: string;
  status?: WorkPostStatus;
  createdAt?: Date;
  workMode: WorkMode;

  projetId?: string;
  projetTitle?: string;
}