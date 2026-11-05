// pages/checkout/checkout.ts
import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  faMoneyBillWave,
  faCreditCard,
  faBuildingColumns,
  faTruck,
  faArrowLeft,
  faCheck,
  faLocationDot,
} from '@fortawesome/free-solid-svg-icons';

import { CartService } from '../../core/services/http-cart';
import { AlertService } from '../../core/services/alert';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

interface UserAddress {
  country: string;
  department: string;
  city: string;
  street: string;
  carrera: string;
  neighborhood: string;
}

@Component({
  selector: 'app-checkout',
  imports: [AsyncPipe, CurrencyPipe, FormsModule, RouterLink, FaIconComponent, ImageUrlPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export default class Checkout implements OnInit {
  cartService = inject(CartService);
  private alert = inject(AlertService);
  private router = inject(Router);

  faArrowLeft = faArrowLeft;
  faCheck = faCheck;
  faTruck = faTruck;
  faCreditCard = faCreditCard;
  faLocationDot = faLocationDot;
  private readonly USER_STORAGE_KEY = 'user';


  savedAddress: UserAddress | null = null;

  addressMode: 'saved' | 'new' = 'new';


  direccion = {
    calle: '',
    ciudad: '',
    referencia: '',
  };

  metodosPago = [
    { value: 'cash', label: 'Efectivo contra entrega', icon: faMoneyBillWave },
    { value: 'card', label: 'Tarjeta de crédito/débito', icon: faCreditCard },
    { value: 'transfer', label: 'Transferencia bancaria', icon: faBuildingColumns },
  ];
  metodoPago = '';

  loading = false;
  error = '';

  ngOnInit() {
    this.loadSavedAddress();
  }

  private loadSavedAddress() {
    try {
      const raw = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!raw) return;

      const user = JSON.parse(raw);

      const address: UserAddress | undefined = user?.address;

      if (address?.city && address?.country) {
        this.savedAddress = address;
        this.addressMode = 'saved';
      }
    } catch {
      this.savedAddress = null;
    }
  }

  get formattedSavedAddress(): string {
    if (!this.savedAddress) return '';
    const { carrera, street, neighborhood, city, department, country } = this.savedAddress;
    return `Cra. ${carrera} # ${street}, ${neighborhood} — ${city}, ${department}, ${country}`;
  }

  get direccionValida() {
    if (this.addressMode === 'saved') return !!this.savedAddress;
    return this.direccion.calle.trim().length > 0 && this.direccion.ciudad.trim().length > 0;
  }

  private buildDireccionFromForm(): string {
    return [this.direccion.calle, this.direccion.ciudad, this.direccion.referencia]
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
      .join(', ');
  }

  onSubmit() {
    if (!this.direccionValida || !this.metodoPago) return;

    this.error = '';
    this.loading = true;

    const direccionEnvio =
      this.addressMode === 'saved' && this.savedAddress
        ? this.formattedSavedAddress
        : this.buildDireccionFromForm();

    this.cartService.checkout(direccionEnvio, this.metodoPago).subscribe({
      next: () => {
        this.loading = false;
        this.alert.success?.('Pedido confirmado', 'Tu compra se procesó correctamente'); 
        this.router.navigateByUrl('/home')
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.msg || 'No se pudo procesar el pedido, intenta de nuevo';
        this.alert.error('Error al confirmar el pedido', err.error?.msg);
      },
    });
  }
}