import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { HttpHistory } from '../../../core/services/http-history';
import { HttpServiceRecord } from '../../../core/services/http-service-record';
import { HttpOrders } from '../../../core/services/http-orders';
import { BackButton } from '../../../shared/components/back-button/back-button';
import { AlertService } from '../../../core/services/alert';

@Component({
    selector: 'app-history-detail',
    imports: [CurrencyPipe, DatePipe, AsyncPipe, BackButton],
    templateUrl: './history-detail.html',
    styleUrl: './history-detail.css',
})
export default class HistoryDetail implements OnInit {
    private httpHistory = inject(HttpHistory);
    private httpServiceRecord = inject(HttpServiceRecord);
    private httpOrders = inject(HttpOrders);
    private route = inject(ActivatedRoute);
    private location = inject(Location);
    private alert = inject(AlertService);

    clientId!: string;

    // El doc de History ya viene con todo poblado (usuario, órdenes y
    // servicios con su cita/moto/servicio anidados) — un solo request.
    history$ = new BehaviorSubject<any>(null);
    notFound$ = new BehaviorSubject<boolean>(false);

    ngOnInit(): void {
        this.clientId = this.route.snapshot.paramMap.get('userId')!;
        this.loadHistory();
    }

    goBack(): void {
        this.location.back();
    }

    getTotal(items: any[] | undefined, field: string): number {
        return (items ?? []).reduce((sum, item) => sum + (item?.[field] || 0), 0);
    }

    // Arma "2x Casco, 1x Aceite" a partir de order.products.
    // Soporta tanto { product: { name }, quantity } (populado) como { name, quantity } plano.
    getProductNames(items: any[] | undefined): string {
        if (!items?.length) return 'Sin productos';
        return items
            .map((item) => {
                const name = item?.product?.name || item?.name || 'Producto sin nombre';
                const qty = item?.quantity ?? 1;
                return `${qty}x ${name}`;
            })
            .join(', ');
    }

    private loadHistory(): void {
        this.httpHistory.getHistoryByUserId(this.clientId).subscribe({
            next: (res: any) => {
                this.notFound$.next(false);
                this.history$.next(res?.history ?? null);
            },
            error: (error) => {
                if (error?.status === 404) {
                    this.notFound$.next(true);
                    this.history$.next(null);
                } else {
                    console.error(error);
                }
            },
        });
    }

    async onDeleteRecord(id: string) {
        const confirmed = await this.alert.confirmDelete('el registro de', 'este servicio');
        if (!confirmed) return;

        this.httpServiceRecord.deleteServiceRecord(id).subscribe({
            next: () => {
                this.alert.success('Eliminado', 'El registro se eliminó correctamente');
                const current = this.history$.value;
                if (current) {
                    this.history$.next({
                        ...current,
                        services: (current.services ?? []).filter((s: any) => s._id !== id),
                    });
                }
            },
            error: (error) => this.alert.error('Error al eliminar', error.error?.msg),
        });
    }

    async onDeleteOrder(id: string) {
        const confirmed = await this.alert.confirmDelete('la orden de', 'esta compra');
        if (!confirmed) return;

        this.httpOrders.deleteOrder(id).subscribe({
            next: () => {
                this.alert.success('Eliminada', 'La orden se eliminó correctamente');
                const current = this.history$.value;
                if (current) {
                    this.history$.next({
                        ...current,
                        products: (current.products ?? []).filter((o: any) => o._id !== id),
                    });
                }
            },
            error: (error) => this.alert.error('Error al eliminar', error.error?.msg),
        });
    }
}