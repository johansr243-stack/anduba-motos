import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class HttpMotorcycles {
  private http = inject(HttpClient);
  BASE_URL: string = environment.apiUrl;

  getMotorcycles() {
    return this.http.get<any>(`${this.BASE_URL}/motorcycles`).pipe(
      tap((res) => {
        console.log(res);
      }),
      map((res) => {
        return res.data;
      }),
      catchError((error) => {
        return of([]);
      }),
    );
  }

  getMotorcycleById(id: string) {
    return this.http.get<any>(`${this.BASE_URL}/motorcycles/${id}`);
  }

  createMotorcycle(newMotorcycle: any) {
    return this.http.post(`${this.BASE_URL}/motorcycles`, newMotorcycle);
  }

  editMotorcycle(id: string, updateData: any) {
    return this.http.patch(`${this.BASE_URL}/motorcycles/${id}`, updateData);
  }

  deleteMotorcycle(id: string) {
    return this.http.delete(`${this.BASE_URL}/motorcycles/${id}`);
  }

  getMotorcycleByUserId(id:string){
    return this.http.get<any>(`${this.BASE_URL}/motorcycles/user/${id}`)
  }

}
