import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StudentProfile } from '../models/student-profile.model';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private api = `${environment.apiUrl}/student-profiles`;

  constructor(private http: HttpClient) {}

  getByUserId(userId: string): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.api}/user/${userId}`).pipe(
      catchError(() => of({
        userId,
        education: [],
        workExperience: [],
        technicalSkills: [],
        softSkills: []
      } as StudentProfile))
    );
  }

  save(profile: StudentProfile): Observable<StudentProfile> {
    return this.http.post<StudentProfile>(this.api, profile);
  }
}