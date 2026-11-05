import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpReports } from '../../../core/services/http-reports';

@Component({
  selector: 'app-sales-report',
  imports: [AsyncPipe, CurrencyPipe, DecimalPipe],
  templateUrl: './sales-report.html',
  styleUrl: './sales-report.css',
})
export default class SalesReport implements OnInit, OnDestroy {
  private httpReports = inject(HttpReports);
  private subscriberSummary!: Subscription;

  summary$ = new BehaviorSubject<any>(null);
  loading$ = new BehaviorSubject<boolean>(true);
  errorMsg$ = new BehaviorSubject<string>('');

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.loading$.next(true);
    this.errorMsg$.next('');
    this.subscriberSummary = this.httpReports.getSalesSummary().subscribe({
      next: (res) => {
        this.summary$.next(res.data);
        this.loading$.next(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMsg$.next('No se pudo cargar el resumen de ventas.');
        this.loading$.next(false);
      },
    });
  }

  ngOnDestroy() {
    this.subscriberSummary?.unsubscribe();
  }
}