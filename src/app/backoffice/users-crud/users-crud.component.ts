import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'company' | 'admin';
  status: 'active' | 'inactive';
  joinedDate: string;
}

@Component({
  selector: 'b2u-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './users-crud.component.html',
  styleUrls: ['./users-crud.component.scss']
})
export class UsersCrudComponent {
  searchQuery = '';
  filterRole = 'all';
  showDeleteConfirm = false;
  selectedUser: UserRow | null = null;

  users: UserRow[] = [
    { id: '1', name: 'Ali Ben Salah',    email: 'ali@etu.tn',      role: 'student', status: 'active',   joinedDate: '2025-01-15' },
    { id: '2', name: 'Sarra Mansour',    email: 'sarra@etu.tn',    role: 'student', status: 'active',   joinedDate: '2025-02-01' },
    { id: '3', name: 'TechCorp Tunisia', email: 'hr@techcorp.tn',  role: 'company', status: 'active',   joinedDate: '2025-01-10' },
    { id: '4', name: 'StartupHub',       email: 'info@startup.tn', role: 'company', status: 'inactive', joinedDate: '2025-03-01' },
    { id: '5', name: 'Super Admin',      email: 'admin@b2u.tn',    role: 'admin',   status: 'active',   joinedDate: '2024-12-01' },
  ];

  get filtered(): UserRow[] {
    return this.users.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        || u.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchRole = this.filterRole === 'all' || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  toggleStatus(user: UserRow) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
  }

  confirmDelete(user: UserRow) {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  deleteUser() {
    if (this.selectedUser) {
      this.users = this.users.filter(u => u.id !== this.selectedUser!.id);
    }
    this.showDeleteConfirm = false;
    this.selectedUser = null;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedUser = null;
  }
}