import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  switchMap,
} from 'rxjs';

import { HttpServiceRecord } from '../../../core/services/http-service-record';
import { HttpAppointments } from '../../../core/services/http-appointments';
import { HttpUsers } from '../../../core/services/http-users';
import { HttpProducts } from '../../../core/services/http-products';
import { AlertService } from '../../../core/services/alert';
import { BackButton } from '../../../shared/components/back-button/back-button';

import { faCalendarCheck, faBoxesStacked, faUsers } from '@fortawesome/free-solid-svg-icons';
import { QuickCreateButton } from '../../../shared/components/quick-create-button/quick-create-button';

@Component({
  selector: 'app-service-record-form',
  imports: [ReactiveFormsModule, AsyncPipe, CurrencyPipe, BackButton, QuickCreateButton],
  templateUrl: './service-record-form.html',
  styleUrl: './service-record-form.css',
})
export default class ServiceRecordForm implements OnInit {
  faCalendarCheck = faCalendarCheck;
  faBoxesStacked = faBoxesStacked;
  faUsers = faUsers;
  private httpRecord = inject(HttpServiceRecord);
  private httpAppointment = inject(HttpAppointments);
  private httpUsers = inject(HttpUsers);
  private httpProducts = inject(HttpProducts);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  appointmentList$ = new BehaviorSubject<any[]>([]);
  productList$ = new BehaviorSubject<any[]>([]);

  mechanicSearchControl = new FormControl('');
  mechanicResults: any[] = [];
  searchingMechanic = false;
  showMechanicResults = false;

  // ===== Buscador de cliente (mismo patrón que appointment-form: trae TODOS
  // los usuarios una sola vez con getUsers() y filtra en el front, sin pegarle
  // al backend en cada tecla) =====
  private allUsers$ = new BehaviorSubject<any[]>([]);
  clientSearch$ = new BehaviorSubject<string>('');
  clientDropdownOpen$ = new BehaviorSubject<boolean>(false);
  selectedClientId$ = new BehaviorSubject<string | null>(null);

  filteredClients$ = combineLatest([this.allUsers$, this.clientSearch$]).pipe(
    map(([users, term]) => {
      const t = term.toLowerCase().trim();
      if (!t) return users;
      return users.filter((u) => u.username?.toLowerCase().includes(t));
    }),
  );

  // Citas del cliente seleccionado (solo esas se muestran en el <select> de Cita)
  filteredAppointmentsByClient$ = combineLatest([
    this.appointmentList$,
    this.selectedClientId$,
  ]).pipe(
    map(([appointments, clientId]) => {
      if (!clientId) return [];
      return appointments.filter((a) => a.client?._id === clientId);
    }),
  );

  isEditMode = false;
  formTitle = 'Registrar servicio';
  formButton = 'Crear registro';
  recordId: string | null = null;

  existingAppointmentLabel = '';
  existingProducts: any[] = [];

  formData: FormGroup;

  constructor() {
    this.formData = new FormGroup({
      appointment: new FormControl('', Validators.required),
      description: new FormControl('', [Validators.required, Validators.minLength(3)]),
      observations: new FormControl(''),
      usedProducts: new FormArray([this.createProductGroup()]),
      finalCost: new FormControl(null, [Validators.required, Validators.min(0)]),
      mechanic: new FormControl(''),
    });
  }

  get usedProducts(): FormArray {
    return this.formData.get('usedProducts') as FormArray;
  }

  private createProductGroup(): FormGroup {
    return new FormGroup({
      product: new FormControl('', Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit() {
    this.loadAppointments();
    this.loadProducts();
    this.loadUsers();

    this.recordId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.recordId) {
      this.isEditMode = true;
      this.formTitle = 'Editar registro de servicio';
      this.formButton = 'Guardar cambios';

      // 'appointment' y 'usedProducts' no se editan en este modo (los productos
      // ya se descontaron del stock), así que no deben bloquear el envío del form.
      this.formData.get('appointment')?.clearValidators();
      this.formData.get('appointment')?.updateValueAndValidity();
      this.usedProducts.clear();

      this.loadRecord(this.recordId);
    }

    this.mechanicSearchControl.valueChanges
      .pipe(
        filter((term): term is string => typeof term === 'string'),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = term.trim();
          if (trimmed.length < 2) {
            this.mechanicResults = [];
            this.showMechanicResults = false;
            this.searchingMechanic = false;
            this.cdr.markForCheck();
            return EMPTY;
          }
          this.searchingMechanic = true;
          // 'mechanic' filtra por rol -- verifica que sea el string exacto
          // que tu backend espera en searchUsers().
          return this.httpUsers.searchUsers(trimmed, 'mechanic');
        }),
      )
      .subscribe((results) => {
        this.searchingMechanic = false;
        this.mechanicResults = results;
        this.showMechanicResults = true;
        this.cdr.markForCheck();
      });
  }

  selectMechanic(user: any) {
    this.formData.get('mechanic')?.setValue(user._id);
    this.mechanicSearchControl.setValue(user.username, { emitEvent: false });
    this.mechanicResults = [];
    this.showMechanicResults = false;
  }

  onMechanicSearchFocus() {
    this.showMechanicResults = this.mechanicResults.length > 0;
  }

  onMechanicSearchBlur() {
    setTimeout(() => {
      this.showMechanicResults = false;
    }, 150);
  }

  private loadUsers(): void {
    this.httpUsers.getUsers().subscribe({
      next: (data) => this.allUsers$.next(data),
      error: (err) => console.error(err),
    });
  }

  // ===== Cliente =====
  onClientInputChange(value: string): void {
    this.clientSearch$.next(value);
    this.clientDropdownOpen$.next(true);
    // Si el usuario sigue escribiendo, invalidamos la selección/cita previas
    this.selectedClientId$.next(null);
    this.formData.get('appointment')?.setValue('');
  }

  selectClient(user: any): void {
    this.selectedClientId$.next(user._id);
    this.clientSearch$.next(user.username);
    this.clientDropdownOpen$.next(false);
    this.formData.get('appointment')?.setValue('');
  }

  closeClientDropdown(): void {
    // Pequeño delay para que el (mousedown) de una opción se registre antes de cerrar
    setTimeout(() => this.clientDropdownOpen$.next(false), 150);
  }

loadAppointments() {
  this.httpAppointment.getAppointments().subscribe({
    next: (res) => {
      const items = Array.isArray(res) ? res : [];
      this.appointmentList$.next(items);
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error(error);
      this.appointmentList$.next([]);
    },
  });
}

  loadProducts() {
    this.httpProducts.getProducts().subscribe({
      next: (data) => {
        this.productList$.next(data);
        this.cdr.markForCheck();
      },
      error: (error) => console.log(error),
    });
  }

  loadRecord(id: string) {
    this.httpRecord.getServiceRecordById(id).subscribe({
      next: (res: any) => {
        const record = res.data ?? res;

        this.formData.patchValue({
          description: record.description ?? '',
          observations: record.observations ?? '',
          finalCost: record.finalCost ?? 0,
        });

        this.existingAppointmentLabel = record.appointment?.client?.username
          ? `${record.appointment.client.username} — ${record.appointment.status ?? ''}`
          : (record.appointment ?? 'Cita no disponible');

        this.existingProducts = record.usedProducts ?? [];

        if (record.mechanic?._id) {
          this.formData.get('mechanic')?.setValue(record.mechanic._id);
          this.mechanicSearchControl.setValue(record.mechanic.username, { emitEvent: false });
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.alert.error('No se pudo cargar el registro', error.error?.msg);
      },
    });
  }

  addProduct() {
    this.usedProducts.push(this.createProductGroup());
  }

  removeProduct(index: number) {
    this.usedProducts.removeAt(index);
  }

  availableProducts(currentIndex: number) {
    const selectedIds = this.usedProducts.controls
      .map((control, i) => (i !== currentIndex ? control.get('product')?.value : null))
      .filter((id) => !!id);

    return this.productList$.value.filter(
      (p: any) => p.status !== 'agotado' && !selectedIds.includes(p._id),
    );
  }

  private getUnitPricePreview(productId: string): number {
    const product = this.productList$.value.find((p: any) => p._id === productId);
    if (!product) return 0;
    return product.price * (1 + (product.roi ?? 0));
  }

  getProductsCostPreview(): number {
    return this.usedProducts.controls.reduce((sum, group) => {
      const productId = group.get('product')?.value;
      const quantity = group.get('quantity')?.value ?? 0;
      return sum + this.getUnitPricePreview(productId) * quantity;
    }, 0);
  }

  getTotalPreview(): number {
    const labor = this.formData.get('finalCost')?.value ?? 0;
    return labor + this.getProductsCostPreview();
  }

  async onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.recordId) {
      const confirmed = await this.alert.confirmSave('el registro de servicio', true);
      if (!confirmed) return;

      const payload: any = {
        description: this.formData.get('description')?.value,
        observations: this.formData.get('observations')?.value,
        finalCost: this.formData.get('finalCost')?.value,
      };
      const mechanic = this.formData.get('mechanic')?.value;
      if (mechanic) {
        payload.mechanic = mechanic;
      }

      this.httpRecord.updateServiceRecord(this.recordId, payload).subscribe({
        next: (res) => console.log(res),
        error: (error) => {
          console.log(error);
          this.alert.error('No se pudo actualizar el registro', error.error?.msg);
        },
        complete: () => {
          this.alert.success('Guardado!', 'Registro actualizado');
          this.router.navigateByUrl('/dashboard/service-records');
        },
      });
      return;
    }


    const laborCost = this.formData.get('finalCost')?.value ?? 0;
    const productsCost = this.getProductsCostPreview();

    const payload = {
      appointment: this.formData.get('appointment')?.value,
      description: this.formData.get('description')?.value,
      observations: this.formData.get('observations')?.value,
      usedProducts: this.usedProducts.value.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      finalCost: laborCost + productsCost,
    };

    this.httpRecord.createServiceRecord(payload).subscribe({
      next: (res) => console.log(res),
      error: (error) => {
        console.log(error);
        if (error.status === 409) {
          this.alert.error('Stock insuficiente', 'No hay stock suficiente para completar el registro');
        } else {
          this.alert.error('No se pudo crear el registro', error.error?.msg);
        }
      },
      complete: () => {
        this.alert.success('Creado!', 'Registro de servicio creado');
        this.router.navigateByUrl('/dashboard/service-records');
      },
    });
  }

  get appointment() {
    return this.formData.get('appointment');
  }

  get description() {
    return this.formData.get('description');
  }

  get finalCost() {
    return this.formData.get('finalCost');
  }
}