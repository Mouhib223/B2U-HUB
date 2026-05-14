import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private url = `${environment.apiUrl}/api/notifications`;

  constructor(private http: HttpClient) {}

  getByStudent(email: string): Observable<StudentNotification[]> {
    return this.http.get<StudentNotification[]>(`${this.url}/student`, { params: { email } });
  }

  markAsRead(id: string): Observable<StudentNotification> {
    return this.http.put<StudentNotification>(`${this.url}/${id}/read`, {});
  }
}
