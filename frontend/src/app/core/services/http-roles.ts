import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
 
@Service()
export class HttpRoles {
  private http = inject(HttpClient);
 
  getRoles() {
 
    return this.http.get<any>(`${environment.apiUrl}/roles`);
  }
}
 
