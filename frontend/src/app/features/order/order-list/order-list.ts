import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { HttpOrders } from '../../../core/services/http-orders';
import { AlertService } from '../../../core/services/alert';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  shipped: 'Enviado',
  delivered: 'Entregado',
  canceled: 'Cancelado',
};

@Component({
  selector: 'app-order-list',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink, FormsModule, NgClass],
  templateUrl: './order-list.html',
  styleUrl: './order-list.css',
})
export default class OrderList implements OnInit {
  private httpOrders = inject(HttpOrders);
  private alert = inject(AlertService);

  orders$ = new BehaviorSubject<any[]>([]);
  filteredOrders$ = new BehaviorSubject<any[]>([]);

  searchTerm = '';
  statusFilter = '';

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.httpOrders.getOrders().subscribe({
      next: (data) => {
        this.orders$.next(data ?? []);
        this.applyFilters();
      },
      error: (error) => console.error(error),
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.orders$.value.filter((o) => {
      const matchesSearch =
        !term ||
        o.user?.username?.toLowerCase().includes(term) ||
        o.direccionEnvio?.toLowerCase().includes(term) ||
        o._id?.toLowerCase().includes(term);

      const matchesStatus = this.statusFilter === '' || o.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    this.filteredOrders$.next(result);
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getAllOrders() {
    return this.orders$.value.length;
  }

  getPendingOrders() {
    return this.orders$.value.filter((o) => o.status === 'pending').length;
  }

  getCanceledOrders() {
    return this.orders$.value.filter((o) => o.status === 'canceled').length;
  }

  getPaidOrders(){
    return this.orders$.value.filter((o)=>{ return o.status === 'paid'}).length
  }

  async onDelete(order: any) {
    const confirmed = await this.alert.confirmDelete('la orden de', order.user?.username ?? order._id);
    if (!confirmed) return;

    this.httpOrders.deleteOrder(order._id).subscribe({
      next: () => {
        this.alert.success('Eliminada!', 'Orden eliminada');
        this.loadOrders();
      },
      error: (error) => {
        this.alert.error('No se pudo eliminar la orden', error.error?.msg);
        console.log(error);
      },
    });
  }
}
