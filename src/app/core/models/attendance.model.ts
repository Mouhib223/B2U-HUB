export interface AttendanceModel {
  id?: string;
  entrepriseId?: string;
  studentId: string;
  date: string;
  present: boolean;
}