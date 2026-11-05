import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';

import { HttpUsers } from '../../../core/services/http-users';
import { AlertService } from '../../../core/services/alert';
import UserCard from '../user-list-card/user-list-card';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-list',
  imports: [AsyncPipe, FormsModule, RouterLink, UserCard, FontAwesomeModule],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export default class UserList {
  faCoffee = faUser;

  subscriberUser!: Subscription;
  subscriberDeleteUser!: Subscription;
  subscriberUpdateuser!: Subscription;

  // Datos originales (todos)
  users$ = new BehaviorSubject<any[]>([]);
  // Datos filtrados que usa el template con async
  filteredUsers$ = new BehaviorSubject<any[]>([]);

  searchTerm: string = '';
  statusFilter: string = '';

  private httpUsers = inject(HttpUsers);
  private alert = inject(AlertService);

  ngOnInit() {
    this.loadUsers();
  }

  // Llamado desde (ngModelChange) en el HTML cuando cambia el input o el select
  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.users$.value.filter((u) => {
      const matchesSearch =
        !term ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.name?.toLowerCase().includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === '' ||
        u.status?.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
    this.filteredUsers$.next(result);
  }

  async onDelete(user: any) {
    const confirmed = await this.alert.confirmDelete('el usuario', user.username);
    if (!confirmed) return;

    this.subscriberDeleteUser = this.httpUsers.deleteUserbyId(user._id).subscribe({
      next: (data) => {
        this.alert.success('Eliminado!', 'Usuario eliminado');
        console.log(data);
        this.loadUsers();
      },
      error: (error) => {
        console.error(error);
        
        this.alert.error('No se pudo eliminar el usuario', error.error?.msg);
        
      },
      complete: () => console.log('eliminado'),
    });
  }

  onEdit(userId: string) {}

  getAllUsers() {
    return this.users$.value.length;
  }

  getBannedUsers() {
    return this.users$.value.filter((u) => u.status == 'banned').length;
  }

  getActiveUsers() {
    return this.users$.value.filter((u) => u.status == 'active').length;
  }

  getInactiveUsers() {
    return this.users$.value.filter((u) => u.status == 'inactive').length;
  }

  getUsername(userId: string) {}

  ngOnDestroy() {
    if (this.subscriberUser) {
      this.subscriberUser.unsubscribe();
      console.log('se elimino la sub');
    }
    if (this.subscriberDeleteUser) {
      this.subscriberDeleteUser.unsubscribe();
      console.log('se elimino la sub');
    }
  }

  private loadUsers() {
    this.subscriberUser = this.httpUsers.getUsers().subscribe({
      next: (data) => {
        console.log(data);
        this.users$.next(data);
        this.applyFilters(); // actualiza la vista con todos los datos al inicio
      },
      error: (error) => console.error(error),
      complete: () => console.log('codigo funciona'),
    });
  }
}
