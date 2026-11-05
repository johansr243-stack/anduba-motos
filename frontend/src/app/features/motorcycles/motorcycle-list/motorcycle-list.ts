import { Component, inject } from '@angular/core';
import { HttpMotorcycles } from '../../../core/services/http-motorcycles';
import { AlertService } from '../../../core/services/alert';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import MotorcycleListCard from '../motorcycle-list-card/motorcycle-list-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-motorcycle-list',
  imports: [AsyncPipe, FormsModule, MotorcycleListCard, RouterLink],
  templateUrl: './motorcycle-list.html',
  styleUrl: './motorcycle-list.css',
})
export default class MotorcycleList {

  motorcycles$ = new BehaviorSubject<any[]>([]);
  
  filteredMotorcycles$ = new BehaviorSubject<any[]>([]);

  searchTerm: string = '';
  statusFilter: string = '';

  private httpMotorcycles = inject(HttpMotorcycles);
  private alert = inject(AlertService);

  ngOnInit() {
    this.httpMotorcycles.getMotorcycles().subscribe({
      next: (data) => {
        console.log(data);
        this.motorcycles$.next(data);
        this.applyFilters(); 
      },
      error: (error) => console.error(error),
      complete: () => console.log('Se traen las motocicletas'),
    });
  }

 
  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const result = this.motorcycles$.value.filter((m) => {
      const matchesSearch =
        !term ||
        m.licensePlate?.toLowerCase().includes(term) ||
        m.serialNumber?.toLowerCase().includes(term) ||
        m.brand?.toLowerCase().includes(term) ||
        m.model?.toLowerCase().includes(term) ||
        m.color?.toLowerCase().includes(term) ||
        m.clientName?.toLowerCase().includes(term) ||
        m.owner?.toLowerCase().includes(term);

      const matchesStatus =
        this.statusFilter === '' ||
        String(m.status) === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
    this.filteredMotorcycles$.next(result);
  }

  async onDelete(motorcycle: any) {
    const confirmed = await this.alert.confirmDelete('la motocicleta', motorcycle.licensePlate);
    if (!confirmed) return;

    this.httpMotorcycles.deleteMotorcycle(motorcycle._id).subscribe({
      next: (data) => {
        this.alert.success('Eliminada!', 'Motocicleta eliminada');
        console.log(data);
        this.ngOnInit();
      },
      error: (error) => {
        this.alert.error('No se pudo eliminar la motocicleta', error.error?.msg);
        console.log(error);
      },
      complete: () => console.log('se elimino la motocicleta'),
    });
  }

  getAllMotorcycles() {
    return this.motorcycles$.value.length;
  }

  getActiveMotorcycles() {
    return this.motorcycles$.value.filter((m) => m.status == true).length;
  }

  getInactiveMotorcycles() {
    return this.motorcycles$.value.filter((m) => m.status == false).length;
  }
}
