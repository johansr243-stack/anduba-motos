import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { HttpServices } from '../../../core/services/http-services';
import { AlertService } from '../../../core/services/alert';
import { BackButton } from '../../../shared/components/back-button/back-button';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-service-form',
  imports: [ReactiveFormsModule, AsyncPipe, BackButton, ImageUrlPipe],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export default class ServiceForm implements OnInit {
  private httpServices = inject(HttpServices);
  private alert = inject(AlertService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  serviceId: string | null = null;
  selectedFile: File | null = null;

  isEditMode$ = new BehaviorSubject<boolean>(false);
  isSubmitting$ = new BehaviorSubject<boolean>(false);

  // Imagen que ya existe en el servidor (ruta relativa: se muestra con el pipe imageUrl)
  existingImage$ = new BehaviorSubject<string | null>(null);
  // Vista previa de la imagen nueva elegida por el usuario (dataURL local: se muestra tal cual, sin el pipe)
  newImagePreview$ = new BehaviorSubject<string | null>(null);
  // Solo se permite 1 imagen por servicio: true si ya hay una puesta (existente o nueva)
  hasImage$ = combineLatest([this.existingImage$, this.newImagePreview$]).pipe(
    map(([existing, preview]) => Boolean(existing || preview)),
  );

  formData = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    description: new FormControl('', [Validators.required, Validators.minLength(7)]),
  });

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id');

    if (this.serviceId) {
      this.isEditMode$.next(true);
      this.loadService(this.serviceId);
    }
  }

  private loadService(id: string): void {
    this.httpServices.getServiceById(id).subscribe({
      next: (service) => {
        this.formData.patchValue({
          name: service.name,
          price: service.price,
          description: service.description,
        });
        if (service.serviceImage) {
          this.existingImage$.next(service.serviceImage);
        }
      },
      error: (error) => {
        console.error(error);
        this.alert.error('Error al cargar el servicio', error.error?.msg);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile = file;
    // La imagen nueva reemplaza visualmente a la existente mientras se decide guardar
    this.existingImage$.next(null);

    const reader = new FileReader();
    reader.onload = () => this.newImagePreview$.next(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeExistingImage(): void {
    this.existingImage$.next(null);
  }

  removeNewImage(): void {
    this.selectedFile = null;
    this.newImagePreview$.next(null);
  }

  async onSubmit(): Promise<void> {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return;
    }

    const isEditMode = this.isEditMode$.value;
    const confirmed = await this.alert.confirmSave('el servicio', isEditMode);
    if (!confirmed) return;

    this.isSubmitting$.next(true);

    const payload = new FormData();
    payload.append('name', this.formData.value.name!);
    payload.append('price', String(this.formData.value.price));
    payload.append('description', this.formData.value.description!);

    if (this.selectedFile) {
      payload.append('image', this.selectedFile);
    } else if (isEditMode && !this.existingImage$.value) {
      // El usuario quitó la imagen existente sin elegir una nueva: se le avisa
      // al backend para que la borre en vez de dejarla como estaba.
      payload.append('removeImage', 'true');
    }

    const request$ = isEditMode
      ? this.httpServices.updateService(this.serviceId!, payload)
      : this.httpServices.createService(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting$.next(false);
        this.alert.success(
          isEditMode ? 'Guardado!' : 'Creado!',
          isEditMode ? 'Servicio actualizado' : 'Servicio creado',
        );
        this.router.navigate(['/services']);
      },
      error: (error) => {
        this.isSubmitting$.next(false);
        this.alert.error('No se pudo guardar el servicio', error.error?.msg);
      },
    });
  }
}
