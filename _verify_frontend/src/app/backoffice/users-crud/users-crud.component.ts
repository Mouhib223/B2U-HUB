import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'b2u-users-crud',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './users-crud.component.html',
  styleUrls: ['./users-crud.component.scss']
})
export class UsersCrudComponent implements OnInit {
  searchQuery = '';
  filterRole  = 'all';
  loading     = true;
  errorMsg    = '';

  users: any[] = [];
  filtered: any[] = [];

  showDeleteConfirm = false;
  selectedUser: any = null;

  editingUser: any  = null;
  showEditModal     = false;

  constructor(private profileService: ProfileService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.profileService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Impossible de charger les utilisateurs';
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.filtered = this.users.filter(u => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      const matchSearch = name.includes(this.searchQuery.toLowerCase())
        || u.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const role = this.normalizeRole(u.role);
      const matchRole = this.filterRole === 'all' || role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  normalizeRole(role: string): string {
    if (!role) return 'student';
    return role.replace('ROLE_', '').toLowerCase();
  }

  openEdit(user: any) {
    this.editingUser = { ...user, roleDisplay: this.normalizeRole(user.role) };
    this.showEditModal = true;
  }

  saveEdit() {
    const payload: any = {
      firstName: this.editingUser.firstName,
      lastName:  this.editingUser.lastName,
      role:      'ROLE_' + this.editingUser.roleDisplay.toUpperCase()
    };

    this.profileService.updateUser(this.editingUser.id, payload).subscribe({
      next: () => {
        this.showEditModal = false;
        this.loadUsers();
      },
      error: () => { this.errorMsg = 'Erreur lors de la modification'; }
    });
  }

  confirmDelete(user: any) {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  deleteUser() {
    if (!this.selectedUser) return;
    this.profileService.deleteUser(this.selectedUser.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.selectedUser = null;
        this.loadUsers();
      },
      error: () => { this.errorMsg = 'Erreur lors de la suppression'; }
    });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.selectedUser = null;
  }
}
