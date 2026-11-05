import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Service()
export class HttpUsers {


  private http = inject(HttpClient);
  BASE_URL: string = environment.apiUrl

  getUsers() {
    return this.http.get<any>(`${this.BASE_URL}/users`).pipe(
      tap( (res) => {
        console.log( res )
      }),
      map((res) => {
        return res.data;
      }),
      catchError((error)=>{
        return of([])
      })
    );
  }

  createUser(newUser:any){

    return this.http.post<any>(`${this.BASE_URL}/users`, newUser)


  }

  deleteUserbyId (userId:string){

    return this.http.delete<any>(`${this.BASE_URL}/users/${userId}`).pipe(tap((res)=>{
      console.log(res)
    }))

  }

  editUserbyId (userId:string | null, editData:any){

    return this.http.patch(`${this.BASE_URL}/users/${userId}`, editData)

  }

  getUserById (userId: any){

    return this.http.get(`${this.BASE_URL}/users/${userId}`)

  }

  searchUsers(term: string, rol?: string, limit: number = 10) {
    let params = new HttpParams().set('q', term).set('limit', limit);

    if (rol) {
      params = params.set('rol', rol);
    }

    return this.http.get<any>(`${this.BASE_URL}/users/search`, { params }).pipe(
      map((res) => res.data),
      catchError(() => of([])),
    );
  }
}
