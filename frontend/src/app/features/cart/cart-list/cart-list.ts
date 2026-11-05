import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { CartService, AdminCart } from '../../../core/services/http-cart';
import { AlertService } from '../../../core/services/alert';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faChevronDown } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-cart-list',
  imports: [AsyncPipe, CurrencyPipe, FormsModule, FontAwesomeModule, ImageUrlPipe],
  templateUrl: './cart-list.html',
  styleUrl: './cart-list.css',
})
export default class CartList {
  faCartShopping = faCartShopping;
  faChevronDown = faChevronDown;

  private httpCart = inject(CartService);
  private alert = inject(AlertService);

  carts$ = new BehaviorSubject<AdminCart[]>([]);
  filteredCarts$ = new BehaviorSubject<AdminCart[]>([]);

  searchTerm = '';

  // Carritos actualmente desplegados (puede haber varios abiertos a la vez).
  // Vista de solo lectura: aquí ya no hay edición ni eliminación de carritos/items.
  private expandedUserIds = new Set<string>();

  ngOnInit() {
    this.loadCarts();
  }

  loadCarts() {
    this.httpCart.getAllCarts().subscribe({
      next: (res) => {
        this.carts$.next(res.data ?? []);
        this.applyFilters();
      },
      error: (error) => {
        console.log(error);
        this.alert.error('No se pudieron cargar los carritos', error.error?.msg);
      },
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.carts$.value.filter((cart) => {
      if (!term) return true;
      return (
        cart.user?.username?.toLowerCase().includes(term) ||
        cart.user?.email?.toLowerCase().includes(term) ||
        cart.products.some((item) => item.product?.name?.toLowerCase().includes(term))
      );
    });
    this.filteredCarts$.next(result);
  }

  getTotalCarts() {
    return this.carts$.value.length;
  }

  getTotalItems(cart: AdminCart) {
    return cart.products.reduce((sum, item) => sum + item.quantity, 0);
  }

  getTotalValue() {
    return this.carts$.value.reduce((sum, cart) => sum + (cart.price ?? 0), 0);
  }

  isExpanded(cart: AdminCart) {
    return this.expandedUserIds.has(cart.user._id);
  }

  toggleExpand(cart: AdminCart) {
    const id = cart.user._id;
    if (this.expandedUserIds.has(id)) {
      this.expandedUserIds.delete(id);
    } else {
      this.expandedUserIds.add(id);
    }
  }
}