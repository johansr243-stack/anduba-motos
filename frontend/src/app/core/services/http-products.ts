import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { ResponseProducts } from '../models/Products';
import { environment } from '../../../environments/environment';

@Service()
export class HttpProducts {
  private http = inject(HttpClient);
  BASE_URL: string = environment.apiUrl;

  getProducts() {
    return this.http.get<any>(`${this.BASE_URL}/products`).pipe(
        tap( (res) => {
                console.log('yes' )
              }),
              map((res) => {
                return res.data;
              }),
              catchError((error)=>{
                return of([])
              })
        
    );
  }
  deleteProduct(id:string){
    return this.http.delete(`${this.BASE_URL}/products/${id}`)

  }
  getProductById(id:string){
    return this.http.get<any>(`${this.BASE_URL}/products/${id}`)
  }
  editProduct(id:string, updateData:any){

    return this.http.patch(`${this.BASE_URL}/products/${id}`,updateData)

  }
  createProducts(newProduct:any){
    return this.http.post(`${this.BASE_URL}/products`, newProduct);
}

  
}

