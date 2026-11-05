import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpCategories } from '../../../core/services/http-categories';
import { BackButton } from '../../../shared/components/back-button/back-button';
import { AlertService } from '../../../core/services/alert';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, BackButton],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export default class CategoryForm {
  private httpCategory = inject(HttpCategories);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  alert = inject(AlertService)

  categoryID: string | null = this.activatedRoute.snapshot.paramMap.get('id');
  isEditMode = !!this.categoryID;

  formData: FormGroup;

  constructor() {
    // Validaciones alineadas con Category.model.js: name es required (y unique en el backend),
    // description es opcional. minLength/maxLength son un límite razonable en el cliente.
    this.formData = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      description: new FormControl('', [Validators.maxLength(1500)]),
    });
  }

  ngOnInit() {
    if (this.isEditMode) {
      this.loadCategory(this.categoryID);
      
    }
  }

  loadCategory(id: string | null) {
    this.httpCategory.getCategoryById(id).subscribe({
      next: (data) => {
        this.formData.patchValue(data.data);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('complete execute');
      },
    });
  }

  async onSubmit() {
    if (this.formData.invalid) {
      console.log('formulario invalido');
      return;
    }

    if (this.isEditMode) {
     const confirmed = await this.alert.confirmSave('la categoria', true);
      if (!confirmed) {
        return;
      }
      this.httpCategory.updateCategory(this.categoryID, this.formData.value).subscribe({
        next: (res) => {
          console.log(res);
          this.router.navigateByUrl('/dashboard//categories');
        },
        error: (error) => {
          console.log(error);
          this.alert.error('No se pudo editar la categoria', error.error?.msg);
        },
        complete: () => {
          console.log('complete execute');
          this.alert.success('Guardado!', 'Categoria actualizada');
          this.router.navigate(['/dashboard/categories']);
        },
      });
    } else {
      this.httpCategory.createCategory(this.formData.value).subscribe({
        next: (res) => {
          console.log(res);
          this.formData.reset();
          this.router.navigateByUrl('/dashboard/categories');
        },
        error: (error) => {
          console.log(error);
          this.alert.error('No se pudo crear la categoria', error.error?.msg);

        },
        complete: () => {
          console.log('complete execute');
          this.alert.success('Creada!', 'Categoria creada');
          this.router.navigate(['/dashboard/categories']);
        },
      });
    }
  }

  get name() {
    return this.formData.get('name');
  }

  get description() {
    return this.formData.get('description');
  }
}