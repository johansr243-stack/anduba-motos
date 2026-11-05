import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AlertService } from '../../core/services/alert';
import { HttpAuth } from '../../core/services/http-auth';
import { HttpMotorcycles } from '../../core/services/http-motorcycles';
import { HttpAppointments } from '../../core/services/http-appointments';
import { HttpServices } from '../../core/services/http-services';
import { ServiceItem } from '../../core/models/Service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLocationDot, faPhone, faClock, faMotorcycle, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { QuickCreateButton } from '../../shared/components/quick-create-button/quick-create-button';


@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyPipe, RouterLink, FontAwesomeModule, QuickCreateButton],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export default class Contact implements OnInit {
  private alert = inject(AlertService);
  private httpAuth = inject(HttpAuth);
  private httpMotorcycles = inject(HttpMotorcycles);
  private httpAppointments = inject(HttpAppointments);
  private httpServices = inject(HttpServices);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  faLocationDot = faLocationDot;
  faPhone = faPhone;
  faClock = faClock;
  faMotorcycle = faMotorcycle;
  faCircleCheck = faCircleCheck;

  currentUser$ = this.httpAuth.user$;

  // Servicio que llegó preseleccionado desde el botón "Agendar" de /services
  selectedService = signal<ServiceItem | null>(null);
  // Catálogo completo, solo se usa si se entra a /contact sin un servicio elegido
  allServices = signal<ServiceItem[]>([]);

  motorcycles = signal<any[]>([]);
  isSubmitting = signal(false);
  // Controla si se muestra la pantalla de "ya agendaste tu cita" en vez del form.
  // Solo se resetea si el usuario navega a otra página (no hay lógica que la
  // vuelva a poner en false dentro de este componente).
  submitSuccess = signal(false);

  appointmentForm = new FormGroup({
    service: new FormControl('', Validators.required),
    motorcycle: new FormControl('', Validators.required),
    schedule: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    const serviceId = this.route.snapshot.queryParamMap.get('serviceId');

    if (serviceId) {
      this.httpServices.getServiceById(serviceId).subscribe({
        next: (service) => {
          this.selectedService.set(service);
          this.appointmentForm.get('service')?.setValue(service._id);
        },
        error: (error) => console.error(error),
      });
    } else {
      this.httpServices.getServices().subscribe({
        next: (services) => this.allServices.set(services),
        error: (error) => console.error(error),
      });
    }

    if (this.httpAuth.isLogged()) {
      const user = this.httpAuth.user;
      if (user?._id) {
        this.loadMotorcycles(user._id);
      }
    }
  }

  private loadMotorcycles(userId: string): void {
    this.httpMotorcycles.getMotorcycleByUserId(userId).subscribe({
      next: (res: any) => this.motorcycles.set(res?.motorcycles ?? []),
      error: (error) => console.error(error),
    });
  }

  get registerMotorcycleQueryParams() {
    const serviceId = this.selectedService()?._id;
    return serviceId ? { serviceId } : {};
  }

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const user = this.httpAuth.user;
    if (!user?._id) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      client: user._id,
      motorcycle: this.appointmentForm.value.motorcycle,
      service: this.appointmentForm.value.service,
      schedule: this.appointmentForm.value.schedule,
    };

    this.httpAppointments.createAppointment(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.alert.success('¡Cita agendada!', 'Te esperamos en el horario elegido.');
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.alert.error('No se pudo agendar la cita', error.error?.msg);
      },
    });
  }
}