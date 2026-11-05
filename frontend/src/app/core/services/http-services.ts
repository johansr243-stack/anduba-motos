import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResponseServices, ServiceItem } from '../models/Service';

@Service()
export class HttpServices {
  private http = inject(HttpClient);

  BASE_URL: string = environment.apiUrl;
  private baseUrl = `${this.BASE_URL}/services`;

  getServices() {
    return this.http
      .get<ResponseServices>(this.baseUrl)
      .pipe(map((res) => res.data));
  }

  getServiceById(id: string) {
    return this.http
      .get<{ msg: string; data: ServiceItem }>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.data));
  }

  createService(formData: FormData) {
    return this.http.post(this.baseUrl, formData);
  }

  updateService(id: string, formData: FormData) {
    return this.http.patch(`${this.baseUrl}/${id}`, formData);
  }

  deleteService(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
