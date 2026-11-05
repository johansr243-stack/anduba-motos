import { Component, inject } from '@angular/core';
import { HttpCategories } from '../../../core/services/http-categories';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-categories-list',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './categories-list.html',
  styleUrl: './categories-list.css',
})
export default class CategoriesList {
  private httpCategory = inject(HttpCategories);
  private router = inject(Router);
  categoryList$ = new BehaviorSubject<any>([]);
  alert = inject(AlertService)

  ngOnInit() {
    this.onLoadData();
  }

  onLoadData() {
    this.httpCategory.getCategory().subscribe({
      next: (res) => {
        this.categoryList$.next(res.data);
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onEdit(id: string) {
    this.router.navigateByUrl(`dashboard/categories/edit/${id}`);
  }

   async onDelete(id: string) {
    const confirmed = await this.alert.confirmDelete('La categoria', "" );
    if (!confirmed) return;
    this.httpCategory.deleteCategory(id).subscribe({
      next: () => {
        this.onLoadData();
        this.alert.success('Eliminada!', 'Categoria eliminada');
      },
      error: (error) => {
        this.alert.error('No se pudo eliminar la categoria', error.error?.msg);
        console.log(error);
      },
    });
  }

  getAllCategories() {
    return this.categoryList$.value.length;
  }
}