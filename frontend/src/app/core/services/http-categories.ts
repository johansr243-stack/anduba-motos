import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';

@Service()
export class HttpCategories {
  private http = inject(HttpClient);

  BASE_URL: string = environment.apiUrl;

  createCategory(newCategory: any) {
    return this.http.post(`${this.BASE_URL}/category`, newCategory);
  }


  getCategory() {

    return this.http.get<any>(`${this.BASE_URL}/category`);
  }
  
  deleteCategory (id: string | null){
    return this.http.delete(`${this.BASE_URL}/category/${id}`);
  }

  getCategoryById(id:string | null){
    return this.http.get<any>(`${this.BASE_URL}/category/${id}`);
  }

  updateCategory(id:string | null, updateCategory: any){
    return this.http.patch(`${this.BASE_URL}/category/${id}`,updateCategory)
  }
}