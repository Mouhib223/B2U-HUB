export type ProjectStatus = 'open' | 'in-progress' | 'closed';

export interface Project {
  id: string;
  title: string;
  description: string;
  companyId: string;
  companyName: string;
  requiredSkills: string[];
  teamSize: number;
  deadline: Date;
  status: ProjectStatus;
  applicantsCount: number;
  createdAt: Date;
}

export interface ProjectFilter {
  skills?: string[];
  status?: ProjectStatus;
  search?: string;
}