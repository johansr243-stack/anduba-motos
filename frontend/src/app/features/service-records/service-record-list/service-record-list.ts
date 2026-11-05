import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { HttpServiceRecord } from '../../../core/services/http-service-record';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-service-record-list',
  imports: [AsyncPipe, CurrencyPipe, DatePipe, RouterLink, FormsModule],
  templateUrl: './service-record-list.html',
  styleUrl: './service-record-list.css',
})
export default class ServiceRecordList implements OnInit {
  private httpRecord = inject(HttpServiceRecord);
  private alert = inject(AlertService);

  records$ = new BehaviorSubject<any[]>([]);
  filteredRecords$ = new BehaviorSubject<any[]>([]);

  searchTerm = '';

  ngOnInit() {
    this.loadRecords();
  }

  loadRecords() {
    this.httpRecord.getServiceRecords().subscribe({
      next: (res: any) => {
        const items = res?.data ?? [];
        this.records$.next(items);
        this.applyFilters();
      },
      error: (error) => console.error(error),
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.records$.value.filter((r) => {
      return (
        !term ||
        r.description?.toLowerCase().includes(term) ||
        r.mechanic?.username?.toLowerCase().includes(term) ||
        r.appointment?.client?.username?.toLowerCase().includes(term)
      );
    });
    this.filteredRecords$.next(result);
  }

  getAllRecords() {
    return this.records$.value.length;
  }
  getTotalRevenue() {
  return this.records$.value.reduce((sum, r) => sum + (r.finalCost ?? 0), 0);
}

getAverageCost() {
  const count = this.records$.value.length;
  if (!count) return 0;
  return this.getTotalRevenue() / count;
}

  async onDelete(record: any) {
    const confirmed = await this.alert.confirmDelete(
      'el registro de servicio de',
      record.description || 'este trabajo',
    );
    if (!confirmed) return;

    this.httpRecord.deleteServiceRecord(record._id).subscribe({
      next: () => {
        this.alert.success('Eliminado!', 'Registro eliminado');
        this.loadRecords();
      },
      error: (error) => {
        this.alert.error('No se pudo eliminar el registro', error.error?.msg);
        console.log(error);
      },
    });
  }
}
