// cart-drawer.ts
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';

import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faXmark, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { CartService } from '../../../core/services/http-cart';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-cart-drawer',
  imports: [AsyncPipe, CurrencyPipe, FaIconComponent, ImageUrlPipe, RouterLink],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css',
})
export class CartDrawer implements OnInit, OnDestroy {
  cartService = inject(CartService);
  faXmark = faXmark;
  faTrash = faTrash;
  faMinus = faMinus;
  faPlus = faPlus;

  // Controla si el <aside>/backdrop siguen montados en el DOM.
  visible = signal(false);
  // Controla si deben reproducir la animación de salida.
  closing = signal(false);

  private isOpenSub?: Subscription;

  ngOnInit(){
    this.cartService.loadCart();

    // Nos desacoplamos del isOpen$ del async pipe para poder
    // mantener el panel montado mientras corre la animación de cierre.
    this.isOpenSub = this.cartService.isOpen$.subscribe((isOpen) => {
      if (isOpen) {
        this.closing.set(false);
        this.visible.set(true);
      } else if (this.visible()) {
        this.closing.set(true);
      }
    });
  }

  ngOnDestroy(){
    this.isOpenSub?.unsubscribe();
    this.cartService.clearCart
  }

  // Se dispara con (animationend) en el panel. Ignoramos el animationend
  // de la animación de entrada porque ahí closing() sigue en false.
  onPanelAnimationEnd() {
    if (this.closing()) {
      this.visible.set(false);
      this.closing.set(false);
    }
  }

  close() {
    this.cartService.close();
  }

  decrease(productId: string, quantity: number) {
    if (quantity <= 1) return;
    this.cartService.updateQuantity(productId, quantity - 1).subscribe();
  }

  increase(productId: string, quantity: number) {
    this.cartService.updateQuantity(productId, quantity + 1).subscribe({
      error: (err) => console.error(err.error?.msg),
    });
  }

  remove(productId: string) {
    this.cartService.removeItem(productId).subscribe();
  }
}