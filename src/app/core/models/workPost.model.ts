export type WorkPostStatus = 'ACTIVE' | 'FILLED' | 'EXPIRED' | 'CLOSED';

export interface WorkPost {
  id?: string;
  entrepriseId?: string;
  title: string;
  description: string;
  hoursPerWeek: number;
  durationWeeks: number;
  requiredSkills: string;
  status?: WorkPostStatus;
  createdAt?: Date;
}