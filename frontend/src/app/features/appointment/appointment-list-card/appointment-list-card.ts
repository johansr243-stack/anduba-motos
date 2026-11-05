import { Component, Input, Output, EventEmitter } from "@angular/core";
import { MongoDatePipe } from "../../../core/pipes/mongo-date-pipe";

@Component({
  selector: 'app-appointment-list-card',
  imports: [MongoDatePipe],
  template: `
    <div class="user-card appointment-card">
      <div class="card-cell">{{ appointment.client?.username || 'N/A' }}</div>
      <div class="card-cell">{{ appointment.motorcycle?.brand }} {{ appointment.motorcycle?.licensePlate }}</div>
      <div class="card-cell">{{ appointment.service?.name || 'N/A' }}</div>
      <div class="card-cell">{{ appointment.schedule | mongoDate }}</div>
      <div class="card-cell">
        <span class="status" [class]="'appointment-status-' + appointment.status">
          {{ appointment.status }}
        </span>
      </div>
      <div class="card-cell actions">
        <button class="btn-edit" (click)="onEdit()">Edit</button>
        <button class="btn-delete" (click)="onDelete()">Delete</button>
      </div>
    </div>
  `,
  styleUrls: ['./appointment-list-card.css'],
})
export default class AppointmentListCard {
  @Input() appointment: any = {};
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<string>();

  onDelete() {
    this.delete.emit(this.appointment._id);
  }

  onEdit() {
    this.edit.emit(this.appointment._id);
  }
}
