import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  async confirmDelete(entityLabel: string, itemName: string): Promise<boolean> {
    const result = await Swal.fire({
      title: `¿Seguro que quiere eliminar ${entityLabel} ${itemName}?`,
      text: 'No se puede deshacer!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
      buttonsStyling: false,
      customClass: {
        popup: 'glass-swal',
        confirmButton: 'glass-btn glass-btn--danger',
        cancelButton: 'glass-btn glass-btn--ghost',
      },
    });
    return result.isConfirmed;
  }


  async confirmSave(entityLabel: string, isEditMode: boolean): Promise<boolean> {
    const result = await Swal.fire({
      title: isEditMode
        ? `¿Guardar los cambios de ${entityLabel}?`
        : `¿Crear ${entityLabel}?`,
      text: isEditMode ? 'Se actualizará la información existente.' : undefined,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: isEditMode ? 'Guardar' : 'Crear',
      buttonsStyling: false,
      customClass: {
        popup: 'glass-swal',
        confirmButton: 'glass-btn glass-btn--success',
        cancelButton: 'glass-btn glass-btn--ghost',
      },
    });
    return result.isConfirmed;
  }

  async confirm(title: string, text?: string, confirmButtonText = 'Confirmar'): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText,
      buttonsStyling: false,
      customClass: {
        popup: 'glass-swal',
        confirmButton: 'glass-btn glass-btn--success',
        cancelButton: 'glass-btn glass-btn--ghost',
      },
    });
    return result.isConfirmed;
  }

  success(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'success',
      buttonsStyling: false,
      customClass: {
        popup: 'glass-swal',
        confirmButton: 'glass-btn glass-btn--success',
      },
    });
  }

  error(title: string, text?: string) {
    Swal.fire({
      title,
      text,
      icon: 'error',
      buttonsStyling: false,
      customClass: {
        popup: 'glass-swal',
        confirmButton: 'glass-btn glass-btn--danger',
      },
    });
  }
}