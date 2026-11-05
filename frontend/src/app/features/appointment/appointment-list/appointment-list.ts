import { Component, inject, OnInit } from '@angular/core';
import { HttpAppointments } from '../../../core/services/http-appointments';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import AppointmentListCard from '../appointment-list-card/appointment-list-card';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-appointment-list',
  imports: [AsyncPipe, RouterLink, AppointmentListCard],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.css',
})
export default class AppointmentList implements OnInit {
  appointments$ = new BehaviorSubject<any[]>([]);
  statusFilter$ = new BehaviorSubject<string>('');
  searchTerm$ = new BehaviorSubject<string>('');

  filteredAppointments$ = combineLatest([
    this.appointments$,
    this.statusFilter$,
    this.searchTerm$,
  ]).pipe(
    map(([appointments, status, search]) => {
      let result = appointments;

      if (status) {
        result = result.filter((a) => a.status === status);
      }

      if (search.trim()) {
        const term = search.toLowerCase().trim();
        result = result.filter((a) =>
          (a.client?.username?.toLowerCase().includes(term)) ||
          (a.motorcycle?.brand?.toLowerCase().includes(term)) ||
          (a.motorcycle?.licensePlate?.toLowerCase().includes(term))
        );
      }

      return result;
    })
  );

  private router = inject(Router);
  private httpAppointment = inject(HttpAppointments);
  private alert = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadAppointments();
  }

  onFilterChange(status: string): void {
    this.statusFilter$.next(status);
  }

  onSearchChange(term: string): void {
    this.searchTerm$.next(term);
  }

  async onDelete(id: string) {
    const appointment = this.appointments$.value.find((a) => a._id === id);
    const confirmed = await this.alert.confirmDelete(
      'la cita de',
      appointment?.client?.username || 'este cliente',
    );
    if (!confirmed) return;

    this.httpAppointment.deleteAppointment(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.alert.success('Eliminada!', 'Cita eliminada');
          this.loadAppointments();
        },
        error: (error) => {
          this.alert.error('No se pudo eliminar la cita', error.error?.msg);
          console.error(error);
        },
      });
  }

  onEdit(id: string) {
    this.router.navigate(['/dashboard/appointments/edit', id]);
  }

  getAllAppointments(): number {
    return this.appointments$.value.length;
  }

  getCancelledAppointments(): number {
    return this.appointments$.value.filter(a => a.status === 'cancelada').length;
  }

  getConfirmedAppointments(): number {
    return this.appointments$.value.filter(a => a.status === 'confirmada').length;
  }

  getPendingAppointments(): number {
    return this.appointments$.value.filter(a => a.status === 'pendiente').length;
  }

  getPostponedAppointments(): number {
    return this.appointments$.value.filter(a => a.status === 'aplazada').length;
  }

  private loadAppointments() {
    this.httpAppointment.getAppointments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.appointments$.next(data);
        },
        error: (error) => console.error(error),
      });
  }
}
