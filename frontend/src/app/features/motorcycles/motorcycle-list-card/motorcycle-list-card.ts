import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MongoDatePipe } from '../../../core/pipes/mongo-date-pipe';

@Component({
  selector: 'motorcycle-list-card',
  imports: [TitleCasePipe, RouterLink, MongoDatePipe],
  template: `
  <div class="user-card">
      <div class="card-cell user-cell">
        <div class="avatar avatar-JC">{{motorcycle.brand?.charAt(0)}}</div>
        <span>{{motorcycle.licensePlate}} - {{motorcycle.brand}} {{motorcycle.modelName}}</span>
      </div>

      <div class="card-cell">
        <span class="role-badge">{{motorcycle.client?.username || 'Sin cliente'}}</span>
      </div>

      <div class="card-cell">{{motorcycle.color | titlecase}}</div>

      @if (motorcycle.status == true){
        <div class="card-cell">
          <span class="status status-Activo">Activa</span>
        </div>
      }
      @else{
        <div class="card-cell">
          <span class="status status-Banned">Inactiva</span>
        </div>
      }

      <div class="card-cell">{{motorcycle.createdAt | mongoDate}}</div>

      <div class="card-cell actions">
        <a class="btn-edit" (click)="onEditCLick()" [routerLink]="['/dashboard/motorcycles/edit', motorcycle._id]">Editar</a>
        <a class="btn-delete" (click)="onDeleteClick()">Eliminar</a>
      </div>
    </div>`,
  styleUrl: './motorcycle-list-card.css',
})
export default class MotorcycleListCard {
  @Input() motorcycle: any;
  @Output() delete = new EventEmitter<any>();
  @Output() edit = new EventEmitter<string>();

  onDeleteClick() {
    this.delete.emit(this.motorcycle);
  }

  onEditCLick() {
    this.edit.emit(this.motorcycle._id);
  }
}