import { HttpClient } from '@angular/common/http'; 
import { inject, Service } from '@angular/core'; 
import { environment } from '../../../environments/environment'; 
import { tap } from 'rxjs';

@Service() 
export class HttpServiceRecord {

  private http = inject(HttpClient); 

  BASE_URL: string = environment.apiUrl; 


  createServiceRecord(newRecord: any) {
    return this.http.post(`${this.BASE_URL}/serviceRecord`, newRecord); 
  }

  getServiceRecords() {
    return this.http.get<any>(`${this.BASE_URL}/serviceRecord`).pipe(tap((res)=>{

      console.log(res)

    })) 
  }

  getServiceRecordById(id: string | null) {
    return this.http.get<any>(`${this.BASE_URL}/serviceRecord/${id}`); 
  }

  updateServiceRecord(id: string | null, updateRecord: any) {
    return this.http.patch<any>(`${this.BASE_URL}/serviceRecord/${id}`, updateRecord); 
  }

  deleteServiceRecord(id: string | null) {
    return this.http.delete(`${this.BASE_URL}/serviceRecord/${id}`);
  }

  getServiceRecordsByUser(userID: string) {
    return this.http.get<any>(`${this.BASE_URL}/serviceRecord/user/${userID}`);
  }

  getServiceRecordsByMechanic(mechanicID: string) {
    return this.http.get<any>(`${this.BASE_URL}/serviceRecord/mechanic/${mechanicID}`);
  }

}
