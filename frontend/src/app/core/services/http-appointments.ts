import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, of, tap } from 'rxjs';
import { ResponseAppointments } from '../models/Appointment';

@Service()
export class HttpAppointments {

  private http = inject(HttpClient);

  BASE_URL: string = environment.apiUrl;

  getAppointments() {
    return this.http.get<ResponseAppointments>(`${this.BASE_URL}/appointment`).pipe(
      tap((res) => {
        console.log(res);
      }),
      map((res) => res.data),
      catchError((error) => {
        console.log(error);
        return of([]);
      }),
    );
  }

  getAppointmentById(id: string) {
    return this.http.get<any>(`${this.BASE_URL}/appointment/${id}`);
  }

  createAppointment(newAppointment: any) {
    return this.http.post(`${this.BASE_URL}/appointment`, newAppointment);
  }

  updateAppointment(id: string, updateData: any) {
    return this.http.patch(`${this.BASE_URL}/appointment/${id}`, updateData);
  }

  deleteAppointment(id: string) {
    return this.http.delete(`${this.BASE_URL}/appointment/${id}`);
  }
}
