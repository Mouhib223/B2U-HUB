export interface SkillScore {
  category: string;
  score: number;
  weight: number;
}

export interface AIScore {
  userId: string;
  overallScore: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  skillScores: SkillScore[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  lastUpdated: Date;
}