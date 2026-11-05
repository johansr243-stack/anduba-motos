import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';

@Service()
export class HttpReports {
  private http = inject(HttpClient);
  BASE_URL: string = environment.apiUrl;

  getSalesSummary() {
    return this.http.get<any>(`${this.BASE_URL}/reports/summary`);
  }
}
