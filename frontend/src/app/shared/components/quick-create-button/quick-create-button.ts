import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Botón pequeño que se coloca al lado de un campo que depende de otro
 * recurso (ej: el cliente de una cita, la categoría de un producto).
 * Lleva al formulario de creación de ese recurso, con el mismo ícono
 * que se usa para esa sección en el Dashboard, para que se reconozca
 * de un vistazo a dónde lleva.
 *
 * Uso:
 * <app-quick-create-button route="/dashboard/users/new" [icon]="faUsers" label="Registrar cliente" />
 */
@Component({
  selector: 'app-quick-create-button',
  imports: [RouterLink, FontAwesomeModule],
  templateUrl: './quick-create-button.html',
  styleUrl: './quick-create-button.css',
})
export class QuickCreateButton {
  @Input({ required: true }) route!: string;
  @Input({ required: true }) icon: any;
  @Input() label = 'Crear nuevo';
  @Input() queryParams: Record<string, any> | null = null;
}
