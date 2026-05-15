export interface Education {
  id?: string;
  degree: string;           // Licence, Master, Ingénieur, etc.
  field: string;            // Computer Science, etc.
  institution: string;
  startYear: number;
  endYear?: number;
  current: boolean;
  gpa?: number;             // 0–20 scale
}

export interface WorkExperience {
  id?: string;
  title: string;            // Frontend Developer
  company: string;
  type: 'stage' | 'freelance' | 'cdi' | 'cdd' | 'projet';
  startDate: string;        // YYYY-MM
  endDate?: string;
  current: boolean;
  description?: string;
  technologies?: string[];
}

export interface TechnicalSkill {
  id?: string;
  name: string;             // React, Java, etc.
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  category: 'frontend' | 'backend' | 'devops' | 'mobile' | 'data' | 'other';
}

export interface SoftSkill {
  id?: string;
  name: string;             // Leadership, Communication, etc.
  level: number;  // 1=weak, 5=excellent
}

export interface StudentProfile {
  id?: string;
  userId: string;
  bio?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  education: Education[];
  workExperience: WorkExperience[];
  technicalSkills: TechnicalSkill[];
  softSkills: SoftSkill[];
  languages?: { name: string; level: string }[];
  createdAt?: string;
  updatedAt?: string;
}