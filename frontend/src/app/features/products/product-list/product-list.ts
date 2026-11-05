import { Component, inject } from '@angular/core';
import { HttpProducts } from '../../../core/services/http-products';
import { AlertService } from '../../../core/services/alert';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import ProductListCard from '../product-list-card/product-list-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  imports: [AsyncPipe, FormsModule, ProductListCard, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export default class ProductList {

  products$ = new BehaviorSubject<any[]>([]);

  filteredProducts$ = new BehaviorSubject<any[]>([]);

  searchTerm: string = '';
  statusFilter: string = '';

  private httpProducts = inject(HttpProducts);
  private alert = inject(AlertService);

  ngOnInit() {
    this.httpProducts.getProducts().subscribe({
      next: (data) => {
        console.log(data);
        this.products$.next(data);
        this.applyFilters(); 
      },
      error: (error) => console.error(error),
      complete: () => console.log('Se traen los productos'),
    });
  }

  
  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.products$.value.filter((p) => {
      const matchesSearch =
        !term ||
        p.name?.toLowerCase().includes(term) ||
        p.serialNumber?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === '' ||
        p.status?.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
    this.filteredProducts$.next(result);
  }

  async onDelete(product: any) {
    const confirmed = await this.alert.confirmDelete('el producto', product.name);
    if (!confirmed) return;

    this.httpProducts.deleteProduct(product._id).subscribe({
      next: (data) => {
        this.alert.success('Eliminado!', 'Producto eliminado');
        console.log(data);
        this.ngOnInit();
      },
      error: (error) => {
        this.alert.error('No se pudo eliminar el producto', error.error?.msg);
        console.log(error);
      },
      complete: () => console.log('se elimino el producto'),
    });
  }

  getAllProducts() {
    return this.products$.value.length;
  }

  getAvailableProducts() {
    return this.products$.value.filter((p) => p.status == 'disponible').length;
  }

  getUnavailableProducts() {
    return this.products$.value.filter((p) => p.status == 'no disponible').length;
  }

  getPendingProducts() {
    return this.products$.value.filter((p) => p.status == 'pendiente').length;
  }

  getOutOfStockProducts() {
    return this.products$.value.filter((p) => p.status == 'agotado').length;
  }
}
