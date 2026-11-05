import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpHistory {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/history`;

  // Solo staff (ver history.routes.js) — para el listado de todos los clientes
  getHistories(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Staff o el dueño del historial — usado tanto en el detalle de admin
  // como en "Mi cuenta" para que cada usuario vea su propio historial
  getHistoryByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${userId}`);
  }

  // Solo owner/admin (ver history.routes.js) — borra el historial completo de un cliente
  deleteHistory(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userId}`);
  }
}