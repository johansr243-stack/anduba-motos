import { Component, inject, OnInit, ChangeDetectorRef, INJECTOR } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpUsers } from '../../../core/services/http-users';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  switchMap,
} from 'rxjs';
import { HttpMotorcycles } from '../../../core/services/http-motorcycles';
import { AlertService } from '../../../core/services/alert';
import { ActivatedRoute, Router } from '@angular/router';
import { BackButton } from '../../../shared/components/back-button/back-button';

import { HttpMotosApi } from '../../../core/services/http-motos-api';
import { AsyncPipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { QuickCreateButton } from '../../../shared/components/quick-create-button/quick-create-button';
import { licensePlateValidator } from '../../../shared/validators/license-plate.validator';

@Component({
  selector: 'app-motorcycle-form',
  imports: [ReactiveFormsModule, BackButton, QuickCreateButton, FontAwesomeModule],
  templateUrl: './motorcycle-form.html',
  styleUrl: './motorcycle-form.css',
})
export default class MotorcycleForm implements OnInit {
  faUsers = faUsers;
  private httpUsers = inject(HttpUsers);
  private httpMotorcycles = inject(HttpMotorcycles);
  private httpMotos = inject(HttpMotosApi);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  motoslist$ = new BehaviorSubject<any[]>([]);
  
  brandSearchControl = new FormControl('');
  brandResults: string[] = [];
  showBrandResults = false;
  private allBrands: string[] = [];

  formData: FormGroup;

  clientSearchControl = new FormControl('');
  clientResults: any[] = [];
  searchingClient = false;
  showClientResults = false;

  isEditMode = false;
  formTitle: string = 'Registrar motocicleta';
  formButton: string = 'Crear motocicleta';
  motorcycleId: string | null = null;

  constructor() {
    this.formData = new FormGroup({
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
  }

  async onSubmit() {
    if (!this.formData.valid) {
      return;
    }

    const formValue = this.formData.value;

    if (this.isEditMode && this.motorcycleId) {
     
      const confirmed = await this.alert.confirmSave('la motocicleta', true);
      if (!confirmed) {
        return;
      }

      this.httpMotorcycles.editMotorcycle(this.motorcycleId, formValue).subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          this.alert.error('No se pudo editar la motocicleta', error.error?.msg);
          console.log(error);
        },
        complete: () => {
          this.alert.success('Guardado!', 'Motocicleta actualizada');
          this.router.navigate(['/dashboard/motorcycles']);
        },
      });
    } else {
      this.httpMotorcycles.createMotorcycle(this.formData.value).subscribe({
        next: (res) => {
          console.log(res);
          this.formData.reset();
        },

        error: (error) => {
          this.alert.error('No se pudo crear la motocicleta', error.error?.msg);
          console.log(error);
        },

        complete: () => {
          console.log('complete execute');
          this.alert.success('Creada!', 'Motocicleta creada');
          this.router.navigate(['/dashboard/motorcycles']);
        },
      });
    }
  }

  ngOnInit() {
    this.motorcycleId = this.activatedRoute.snapshot.paramMap.get('id');

    this.loadMotos();

    if (this.motorcycleId) {
      this.loadMotorcycle(this.motorcycleId);
      this.isEditMode = true;
      this.formTitle = 'Editar motocicleta';
      this.formButton = 'Editar';
    }

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

    this.clientSearchControl.valueChanges
      .pipe(
        filter((term): term is string => typeof term === 'string'),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => {
          const trimmed = term.trim();

       
          if (trimmed.length < 2) {
            this.clientResults = [];
            this.showClientResults = false;
            this.searchingClient = false;
            this.cdr.markForCheck();
            return EMPTY;
          }

          this.searchingClient = true;
          return this.httpUsers.searchUsers(trimmed, 'client');
        }),
      )
      .subscribe((results) => {
        this.searchingClient = false;
        this.clientResults = results;
        this.showClientResults = true;
        this.cdr.markForCheck();
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

  selectClient(user: any) {
    this.formData.get('client')?.setValue(user._id);
    this.clientSearchControl.setValue(user.username, { emitEvent: false });
    this.clientResults = [];
    this.showClientResults = false;
  }

  onClientSearchFocus() {
    this.showClientResults = this.clientResults.length > 0;
  }

  onClientSearchBlur() {
  
    setTimeout(() => {
      this.showClientResults = false;
    }, 150);
  }
loadMotorcycle(motorcycleId: string) {
  this.httpMotorcycles.getMotorcycleById(motorcycleId).subscribe({
    next: (data: any) => {
      const { motorcycle } = data;
      console.log(motorcycle)
      this.formData.patchValue(motorcycle);

      if (motorcycle.brand) {
        this.brandSearchControl.setValue(motorcycle.brand, { emitEvent: false });
      }

      if (motorcycle.client?._id) {
        this.formData.get('client')?.setValue(motorcycle.client._id);
        this.clientSearchControl.setValue(motorcycle.client.username, { emitEvent: false });
      }
      this.cdr.markForCheck();
    },
    error: () => {},
    complete: () => {},
  });
}

  loadMotos() {
    this.httpMotos.getMotos().subscribe({
      next: (d) => {
        this.allBrands = d
        this.motoslist$.next(d);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
  selectBrand(marca: string) {
    this.formData.get('brand')?.setValue(marca);
    this.brandSearchControl.setValue(marca, { emitEvent: false });
    this.brandResults = [];
    this.showBrandResults = false;
  }

  onBrandSearchFocus() {
    this.showBrandResults = this.brandResults.length > 0;
  }

  onBrandSearchBlur() {
    setTimeout(() => {
      this.showBrandResults = false;
    }, 150);
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

  get client() {
    return this.formData.get('client');
  }
}