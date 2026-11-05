import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class HttpOrders {
  private http = inject(HttpClient);
  BASE_URL: string = environment.apiUrl;


  getOrders() {
    return this.http.get<any>(`${this.BASE_URL}/orders`).pipe(
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


  getOrderById(id: string) {
    return this.http.get<any>(`${this.BASE_URL}/orders/${id}`);
  }

  getOrdersByUserId(userId: string) {
    return this.http.get<any>(`${this.BASE_URL}/orders/user/${userId}`);
  }

  createOrder(newOrder: any) {
    return this.http.post<any>(`${this.BASE_URL}/orders`, newOrder);
  }

  updateOrder(id: string, updateData: any) {
    return this.http.patch<any>(`${this.BASE_URL}/orders/${id}`, updateData);
  }

  deleteOrder(id: string) {
    return this.http.delete(`${this.BASE_URL}/orders/${id}`);
  }

  deleteAllOrdersByUserId(userId: string) {
    return this.http.delete(`${this.BASE_URL}/orders/user/${userId}`);
  }
}
