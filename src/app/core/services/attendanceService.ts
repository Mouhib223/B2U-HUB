import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttendanceModel } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/attendance';

  mark(attendance: AttendanceModel): Observable<AttendanceModel> {
    return this.http.post<AttendanceModel>(`${this.baseUrl}/mark`, attendance);
  }

  getByStudent(studentId: string): Observable<AttendanceModel[]> {
    return this.http.get<AttendanceModel[]>(`${this.baseUrl}/student/${studentId}`);
  }

  countAbsences(studentId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/absences/${studentId}`);
  }

  getPresenceRate(studentId: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/presence-rate/${studentId}`);
  }

  getGoodStudents(entrepriseId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/good-students/${entrepriseId}`);
  }
}
