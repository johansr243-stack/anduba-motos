import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { HttpMotorcycles } from '../../../core/services/http-motorcycles';
import { HttpMotosApi } from '../../../core/services/http-motos-api';
import { HttpAuth } from '../../../core/services/http-auth';
import { AlertService } from '../../../core/services/alert';
import { licensePlateValidator } from '../../../shared/validators/license-plate.validator';


@Component({
  selector: 'app-motorcycle-form-client',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './motorcycle-form-client.html',
  styleUrl: './motorcycle-form-client.css',
})
export default class MotorcycleFormClient implements OnInit {
  private httpMotorcycles = inject(HttpMotorcycles);
  private httpMotos = inject(HttpMotosApi);
  private httpAuth = inject(HttpAuth);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  brandSearchControl = new FormControl('');
  brandResults: string[] = [];
  showBrandResults = false;
  private allBrands: string[] = [];

  // serviceId de la cita que se estaba agendando en /contact, para volver
  // exactamente al mismo punto una vez registrada la moto.
  private returnServiceId: string | null = null;

  formData = new FormGroup({
    licensePlate: new FormControl('', [
      Validators.required,
      Validators.maxLength(6),
      licensePlateValidator(),
    ]),
    brand: new FormControl('', [Validators.required]),
    modelName: new FormControl('', [Validators.required]),
    color: new FormControl('', [Validators.required]),
    client: new FormControl('', Validators.required),
    status: new FormControl(true, Validators.required),
  });

  ngOnInit(): void {
    this.returnServiceId = this.route.snapshot.queryParamMap.get('serviceId');

    const currentUser = this.httpAuth.user;
    if (currentUser?._id) {
      this.formData.get('client')?.setValue(currentUser._id);
    }

    this.loadMotos();

    this.formData.get('licensePlate')?.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((value) => {
        if (typeof value === 'string') {
          const upper = value.toUpperCase();
          if (upper !== value) {
            this.formData.get('licensePlate')?.setValue(upper, { emitEvent: false });
          }
        }
      });

    this.brandSearchControl.valueChanges
      .pipe(
        filter((term): term is string => typeof term === 'string'),
        debounceTime(200),
        distinctUntilChanged(),
      )
      .subscribe((term) => {
        const trimmed = term.trim().toLowerCase();

        if (trimmed.length < 1) {
          this.brandResults = [];
          this.showBrandResults = false;
          this.cdr.markForCheck();
          return;
        }

        this.brandResults = this.allBrands.filter((marca) => marca.toLowerCase().includes(trimmed));
        this.showBrandResults = this.brandResults.length > 0;
        this.cdr.markForCheck();
      });
  }

  // Para el link "Volver" del pie de la tarjeta: si veníamos de agendar una
  // cita, conserva el servicio elegido al volver a /contact.
  get backQueryParams() {
    return this.returnServiceId ? { serviceId: this.returnServiceId } : {};
  }

  loadMotos(): void {
    this.httpMotos.getMotos().subscribe({
      next: (d) => {
        this.allBrands = d;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  selectBrand(marca: string): void {
    this.formData.get('brand')?.setValue(marca);
    this.brandSearchControl.setValue(marca, { emitEvent: false });
    this.brandResults = [];
    this.showBrandResults = false;
  }

  onBrandSearchFocus(): void {
    this.showBrandResults = this.brandResults.length > 0;
  }

  onBrandSearchBlur(): void {
    setTimeout(() => {
      this.showBrandResults = false;
    }, 150);
  }

  async onSubmit(): Promise<void> {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    const confirmed = await this.alert.confirmSave('tu moto', false);
    if (!confirmed) return;

    this.httpMotorcycles.createMotorcycle(this.formData.value).subscribe({
      next: () => {
        this.alert.success('Creada!', 'Tu moto quedó registrada');
        this.router.navigate(['/contact'], {
          queryParams: this.returnServiceId ? { serviceId: this.returnServiceId } : {},
        });
      },
      error: (error) => {
        this.alert.error('No se pudo registrar la moto', error.error?.msg);
      },
    });
  }

  get licensePlate() {
    return this.formData.get('licensePlate');
  }

  get brand() {
    return this.formData.get('brand');
  }

  get modelName() {
    return this.formData.get('modelName');
  }

  get color() {
    return this.formData.get('color');
  }
}