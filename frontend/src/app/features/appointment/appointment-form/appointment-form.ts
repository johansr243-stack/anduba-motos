import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpAppointments } from '../../../core/services/http-appointments';
import { HttpUsers } from '../../../core/services/http-users';
import { HttpServices } from '../../../core/services/http-services';
import { HttpMotorcycles } from '../../../core/services/http-motorcycles';
import { AlertService } from '../../../core/services/alert';
import { BackButton } from '../../../shared/components/back-button/back-button';

import { faUsers, faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { QuickCreateButton } from '../../../shared/components/quick-create-button/quick-create-button';

@Component({
  selector: 'app-appointment-form',
  imports: [ReactiveFormsModule, AsyncPipe, BackButton, QuickCreateButton],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.css',
})
export default class AppointmentForm implements OnInit {
  faUsers = faUsers;
  faMotorcycle = faMotorcycle;

  private httpAppointment = inject(HttpAppointments);
  private httpUsers = inject(HttpUsers);
  private httpServices = inject(HttpServices);
  private httpMotorcycles = inject(HttpMotorcycles);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // ===== Modo del formulario =====
  isEditMode = false;
  appointmentId: string | null = null;
  formTitle = 'Agendar cita';
  formButton = 'Agendar cita';

  // Datos completos cargados del backend
  private allUsers$ = new BehaviorSubject<any[]>([]);
  private allServices$ = new BehaviorSubject<any[]>([]);
  private clientMotorcycles$ = new BehaviorSubject<any[]>([]);

  // Texto que el usuario escribe en cada buscador
  clientSearch$ = new BehaviorSubject<string>('');
  motorcycleSearch$ = new BehaviorSubject<string>('');
  serviceSearch$ = new BehaviorSubject<string>('');

  // Qué lista desplegable está abierta ahora mismo
  openDropdown$ = new BehaviorSubject<'client' | 'motorcycle' | 'service' | null>(null);

  // Coincidencias filtradas en vivo
  filteredClients$ = combineLatest([this.allUsers$, this.clientSearch$]).pipe(
    map(([users, term]) => {
      const t = term.toLowerCase().trim();
      if (!t) return users;
      return users.filter((u) => u.username?.toLowerCase().includes(t));
    })
  );

  filteredMotorcycles$ = combineLatest([this.clientMotorcycles$, this.motorcycleSearch$]).pipe(
    map(([motos, term]) => {
      const t = term.toLowerCase().trim();
      if (!t) return motos;
      return motos.filter((m) =>
        `${m.brand} ${m.modelName} ${m.licensePlate}`.toLowerCase().includes(t)
      );
    })
  );

  filteredServices$ = combineLatest([this.allServices$, this.serviceSearch$]).pipe(
    map(([services, term]) => {
      const t = term.toLowerCase().trim();
      if (!t) return services;
      return services.filter((s) => s.name?.toLowerCase().includes(t));
    })
  );

  isSubmitting$ = new BehaviorSubject<boolean>(false);

  formData = new FormGroup({
    client: new FormControl('', [Validators.required]),
    motorcycle: new FormControl('', [Validators.required]),
    service: new FormControl('', [Validators.required]),
    schedule: new FormControl('', [Validators.required]),
    status: new FormControl('confirmada'),
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadServices();

    this.appointmentId = this.route.snapshot.paramMap.get('id');

    if (this.appointmentId) {
      this.isEditMode = true;
      this.formTitle = 'Editar cita';
      this.formButton = 'Guardar cambios';
      this.loadAppointment(this.appointmentId);
    } else {
      this.preselectServiceFromQueryParam();
    }
  }

  private loadUsers(): void {
    this.httpUsers
      .getUsers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.allUsers$.next(data),
        error: (err) => console.error(err),
      });
  }

  private loadServices(): void {
    this.httpServices
      .getServices()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.allServices$.next(data),
        error: (err) => console.error(err),
      });
  }

  /**
   * Carga la cita a editar y precarga cliente, moto, servicio y fecha.
   * OJO: se asume que el backend devuelve `client`, `motorcycle` y `service`
   * ya poblados (objetos con _id + los campos de nombre), igual que en tu
   * ejemplo de appointment-edit-form.ts (`data.service._id`). Si tu backend
   * solo devuelve los IDs sueltos, avísame y agrego el fetch individual de
   * cada uno (getUserById / getMotorcycleById / getServiceById).
   */
  private loadAppointment(id: string): void {
    this.httpAppointment
      .getAppointmentById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: any) => {
          // TEMPORAL: deja este log hasta confirmar la forma exacta de la
          // respuesta del backend, luego lo puedes borrar.
          console.log('appointment raw response:', data);

          // getAppointmentById no hace map(res => res.data) como getAppointments,
          // así que cubrimos las variantes más comunes de respuesta del backend.
          const appointment = data?.data ?? data?.appointment ?? data;
          const client = appointment.client;
          const motorcycle = appointment.motorcycle;
          const service = appointment.service;

          // Cliente
          if (client) {
            this.formData.get('client')?.setValue(client._id);
            this.clientSearch$.next(client.username ?? '');

            // Hay que traer las motos de este cliente ANTES de poder
            // mostrar el texto de la moto seleccionada en el input.
            this.httpMotorcycles
              .getMotorcycleByUserId(client._id)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (value: any) => this.clientMotorcycles$.next(value.motorcycles ?? []),
                error: (err) => console.error(err),
              });
          }

          // Moto
          if (motorcycle) {
            this.formData.get('motorcycle')?.setValue(motorcycle._id);
            this.motorcycleSearch$.next(
              `${motorcycle.brand} ${motorcycle.modelName} — ${motorcycle.licensePlate}`
            );
          }

          // Servicio
          if (service) {
            this.formData.get('service')?.setValue(service._id);
            this.serviceSearch$.next(service.name ?? '');
          }

          // Fecha y hora (datetime-local exige formato 'YYYY-MM-DDTHH:mm' en hora local)
          if (appointment.schedule) {
            this.formData.get('schedule')?.setValue(this.toDatetimeLocal(appointment.schedule));
          }

          if (appointment.status) {
            this.formData.get('status')?.setValue(appointment.status);
          }
        },
        error: (error) => {
          console.error(error);
          this.alert.error(
            'Error al cargar la cita',
            error.error?.msg || 'No se pudo obtener la información de la cita'
          );
        },
      });
  }

  private toDatetimeLocal(value: string): string {
    const date = new Date(value);
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  private preselectServiceFromQueryParam(): void {
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');
    if (!serviceId) return;

    // Espera a que los servicios carguen para poder mostrar el nombre en el input
    const check = setInterval(() => {
      const service = this.allServices$.value.find((s) => s._id === serviceId);
      if (service) {
        this.selectService(service);
        clearInterval(check);
      }
    }, 100);
  }

  // ===== Cliente =====
  onClientInputChange(value: string): void {
    this.clientSearch$.next(value);
    this.openDropdown$.next('client');
    this.formData.get('client')?.setValue('');
  }

  selectClient(user: any): void {
    this.formData.get('client')?.setValue(user._id);
    this.clientSearch$.next(user.username);
    this.openDropdown$.next(null);

    // Resetea moto seleccionada y trae las motos de este cliente
    this.formData.get('motorcycle')?.setValue('');
    this.motorcycleSearch$.next('');
    this.clientMotorcycles$.next([]);

    this.httpMotorcycles
      .getMotorcycleByUserId(user._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (value: any) => this.clientMotorcycles$.next(value.motorcycles ?? []),
        error: (err) => console.error(err),
      });
  }

  // ===== Moto =====
  onMotorcycleInputChange(value: string): void {
    this.motorcycleSearch$.next(value);
    this.openDropdown$.next('motorcycle');
    this.formData.get('motorcycle')?.setValue('');
  }

  selectMotorcycle(moto: any): void {
    this.formData.get('motorcycle')?.setValue(moto._id);
    this.motorcycleSearch$.next(`${moto.brand} ${moto.modelName} — ${moto.licensePlate}`);
    this.openDropdown$.next(null);
  }

  // ===== Servicio =====
  onServiceInputChange(value: string): void {
    this.serviceSearch$.next(value);
    this.openDropdown$.next('service');
    this.formData.get('service')?.setValue('');
  }

  selectService(service: any): void {
    this.formData.get('service')?.setValue(service._id);
    this.serviceSearch$.next(service.name);
    this.openDropdown$.next(null);
  }

  closeDropdowns(): void {
    // Pequeño delay para que el click en una opción se registre antes de cerrar
    setTimeout(() => this.openDropdown$.next(null), 150);
  }

  onSend(): void {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    this.isSubmitting$.next(true);

    const request$ =
      this.isEditMode && this.appointmentId
        ? this.httpAppointment.updateAppointment(this.appointmentId, this.formData.value)
        : this.httpAppointment.createAppointment(this.formData.value);

    request$.subscribe({
      next: () => {
        this.isSubmitting$.next(false);

        if (this.isEditMode) {
          this.alert.success('Actualizada', 'La cita se actualizó correctamente');
        } else {
          this.alert.success('Agendada!', 'La cita quedó registrada correctamente');
        }
        this.router.navigate(['/dashboard/appointments']);
      },
      error: (error: any) => {
        this.isSubmitting$.next(false);
        this.alert.error(
          this.isEditMode ? 'Error al editar la cita' : 'Error al crear la cita',
          error.error?.msg
        );
      },
    });
  }
}