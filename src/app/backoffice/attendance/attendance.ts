import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AttendanceService } from '../../core/services/attendanceService';
import { AuthService } from '../../core/services/auth.service';
import { AttendanceModel } from '../../core/models/Attendance.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, DecimalPipe],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.scss']
})
export class AttendanceComponent implements OnInit {

  private attendanceService = inject(AttendanceService);
  private auth = inject(AuthService);

  entrepriseId: string = '';
  studentId: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  isPresent: boolean = true;
  isLoading: boolean = false;

  attendances: AttendanceModel[] = [];
  presenceRate: number = 0;
  absenceCount: number = 0;
  goodStudents: string[] = [];

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) this.entrepriseId = user.email;
  }

  markAttendance(): void {
    if (!this.studentId || !this.selectedDate) return;

    const attendance: AttendanceModel = {
      entrepriseId: this.entrepriseId,
      studentId: this.studentId,
      date: this.selectedDate,
      present: this.isPresent
    };

    this.isLoading = true;
    this.attendanceService.mark(attendance).subscribe({
      next: (a: AttendanceModel) => {
        this.attendances.unshift(a);
        this.loadStats();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    if (!this.studentId) return;

    this.attendanceService.getByStudent(this.studentId).subscribe(
      (data: AttendanceModel[]) => this.attendances = data
    );
    this.attendanceService.getPresenceRate(this.studentId).subscribe(
      (rate: number) => this.presenceRate = rate
    );
    this.attendanceService.countAbsences(this.studentId).subscribe(
      (count: number) => this.absenceCount = count
    );
    this.attendanceService.getGoodStudents(this.entrepriseId).subscribe(
      (list: string[]) => this.goodStudents = list
    );
  }

  searchStudent(): void {
    if (!this.studentId) return;
    this.isLoading = true;
    this.loadStats();
    this.isLoading = false;
  }
}