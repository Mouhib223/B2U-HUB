export interface StudentNotification {
  id?: string;
  studentEmail: string;
  candidatureId?: string;
  projectTitle?: string;
  title: string;
  message: string;
  status?: string;
  read: boolean;
  createdAt?: string;
}
