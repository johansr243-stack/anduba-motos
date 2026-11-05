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
import { BehaviorSubject, debounceTime, distinctUntilChanged, EMPTY, filter, switchMap } from 'rxjs';

import { HttpOrders } from '../../../core/services/http-orders';
import { HttpProducts } from '../../../core/services/http-products';
import { HttpUsers } from '../../../core/services/http-users';
import { AlertService } from '../../../core/services/alert';
import { BackButton } from '../../../shared/components/back-button/back-button';

import { faUsers, faBoxesStacked } from '@fortawesome/free-solid-svg-icons';
import { QuickCreateButton } from '../../../shared/components/quick-create-button/quick-create-button';

@Component({
  selector: 'app-order-form',
  imports: [ReactiveFormsModule, CurrencyPipe, BackButton, QuickCreateButton],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css',
})
export default class OrderForm implements OnInit {
  faUsers = faUsers;
  faBoxesStacked = faBoxesStacked;
  private httpOrders = inject(HttpOrders);
  private httpProducts = inject(HttpProducts);
  private httpUsers = inject(HttpUsers);
  private alert = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  productList$ = new BehaviorSubject<any[]>([]);

  clientSearchControl = new FormControl('');
  clientResults: any[] = [];
  searchingClient = false;
  showClientResults = false;

  isEditMode = false;
  formTitle = 'Registrar orden';
  formButton = 'Crear orden';
  orderId: string | null = null;

  existingUserLabel = '';
  existingProducts: any[] = [];
  existingTotal = 0;

  formData: FormGroup;

  constructor() {
    this.formData = new FormGroup({
      user: new FormControl('', Validators.required),
      products: new FormArray([this.createProductGroup()]),
      status: new FormControl('pending', Validators.required),
      direccionEnvio: new FormControl(''),
      metodoPago: new FormControl('', Validators.required),
    });
  }

  get products(): FormArray {
    return this.formData.get('products') as FormArray;
  }

  private createProductGroup(): FormGroup {
    return new FormGroup({
      product: new FormControl('', Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    });
  }

  ngOnInit() {
    this.loadProducts();

    this.orderId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.orderId) {
      this.isEditMode = true;
      this.formTitle = 'Editar orden';
      this.formButton = 'Guardar cambios';

      
      this.formData.get('user')?.clearValidators();
      this.formData.get('user')?.updateValueAndValidity();
      this.products.clear();

      this.loadOrder(this.orderId);
    }

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
  }

  selectClient(user: any) {
    this.formData.get('user')?.setValue(user._id);
    this.clientSearchControl.setValue(`${user.username}`, { emitEvent: false });
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

  loadProducts() {
    this.httpProducts.getProducts().subscribe({
      next: (data) => {this.productList$.next(data)
        this.cdr.markForCheck()
      },
      error: (error) => console.log(error),
    });
  }

  loadOrder(id: string) {
    this.httpOrders.getOrderById(id).subscribe({
      next: (res: any) => {
        const order = res.order ?? res.data ?? res;

        this.formData.patchValue({
          status: order.status ?? 'pending',
          direccionEnvio: order.direccionEnvio ?? '',
          metodoPago: order.metodoPago ?? '',
        });

        this.existingUserLabel = order.user?.username
          ? `${order.user.username}${order.user.email ? ' — ' + order.user.email : ''}`
          : (order.user ?? 'Cliente no disponible');

        this.existingProducts = order.products ?? [];
        this.existingTotal = order.total ?? 0;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.log(error);
        this.alert.error('No se pudo cargar la orden', error.error?.msg);
      },
    });
  }

  addProduct() {
    this.products.push(this.createProductGroup());
  }

  removeProduct(index: number) {
    this.products.removeAt(index);
  }

  getUnitPricePreview(productId: string): number {
    const product = this.productList$.value.find((p: any) => p._id === productId);
    if (!product) return 0;
    return product.price * (1 + (product.roi ?? 0));
  }

  computeTotalPreview(): number {
    return this.products.controls.reduce((sum, group) => {
      const productId = group.get('product')?.value;
      const quantity = group.get('quantity')?.value ?? 0;
      return sum + this.getUnitPricePreview(productId) * quantity;
    }, 0);
  }

  async onSubmit() {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.orderId) {
      const confirmed = await this.alert.confirmSave('la orden', true);
      if (!confirmed) return;

      const payload = {
        status: this.formData.get('status')?.value,
        direccionEnvio: this.formData.get('direccionEnvio')?.value,
        metodoPago: this.formData.get('metodoPago')?.value,
      };

      this.httpOrders.updateOrder(this.orderId, payload).subscribe({
        next: (res) => console.log(res),
        error: (error) => {
          console.log(error);
          this.alert.error('No se pudo actualizar la orden', error.error?.msg);
        },
        complete: () => {
          this.alert.success('Guardado!', 'Orden actualizada');
          this.router.navigateByUrl('/dashboard/orders');
        },
      });
      return;
    }

    const payload = {
      user: this.formData.get('user')?.value,
      products: this.products.value.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      status: this.formData.get('status')?.value,
      direccionEnvio: this.formData.get('direccionEnvio')?.value,
      metodoPago: this.formData.get('metodoPago')?.value,
    };

    this.httpOrders.createOrder(payload).subscribe({
      next: (res) => console.log(res),
      error: (error) => {
        console.log(error);
        if (error.status === 409) {
          this.alert.error('Stock insuficiente', 'No hay stock suficiente para completar la orden');
        } else {
          this.alert.error('No se pudo crear la orden', error.error?.msg);
        }
      },
      complete: () => {
        this.alert.success('Creada!', 'Orden creada');
        this.router.navigateByUrl('/dashboard/orders');
      },
    });
  }
  availableProducts(currentIndex: number) {
  const selectedIds = this.products.controls
    .map((control, i) => (i !== currentIndex ? control.get('product')?.value : null))
    .filter((id) => !!id);

  return this.productList$.value.filter(
    (p: any) => p.status !== 'agotado' && !selectedIds.includes(p._id),
  );
}
  get user() {
    return this.formData.get('user');
  }

  get status() {
    return this.formData.get('status');
  }

  get metodoPago() {
    return this.formData.get('metodoPago');
  }
}