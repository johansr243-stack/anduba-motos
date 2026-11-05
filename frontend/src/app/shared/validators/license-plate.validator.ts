import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Formato de placa de motocicleta en Colombia:
 * 3 letras seguidas de 3 caracteres numéricos, donde el último de esos 3
 * puede ser también una letra (único caso permitido). Ejemplos válidos:
 * ABC123, ABC12A. No se permiten más letras al final ni otros formatos.
 */
const LICENSE_PLATE_PATTERN = /^[A-Za-z]{3}[0-9]{2}[0-9A-Za-z]$/;

export function licensePlateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      // El caso vacío lo maneja Validators.required
      return null;
    }

    return LICENSE_PLATE_PATTERN.test(String(value).trim()) ? null : { invalidPlate: true };
  };
}
