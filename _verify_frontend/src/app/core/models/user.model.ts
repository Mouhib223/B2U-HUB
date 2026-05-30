export type UserRole = string;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  skills?: string[];
  university?: string;
  graduationYear?: number;
  companyName?: string;
  industry?: string;
  aiScore?: number;
  createdAt: Date;
}
