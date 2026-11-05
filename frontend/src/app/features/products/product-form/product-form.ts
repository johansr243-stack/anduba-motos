import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpCategories } from '../../../core/services/http-categories';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpProducts } from '../../../core/services/http-products';
import { AlertService } from '../../../core/services/alert';
import { ActivatedRoute, Router } from '@angular/router';
import { BackButton } from '../../../shared/components/back-button/back-button';
import { QuickCreateButton } from '../../../shared/components/quick-create-button/quick-create-button';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';
import { faTags } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, AsyncPipe, BackButton, QuickCreateButton, ImageUrlPipe],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export default class ProductForm {
  faTags = faTags;
  private httpcategory = inject(HttpCategories);
  categoryList$ = new BehaviorSubject<any[]>([]);
  private httpProducts = inject(HttpProducts);
  private alert = inject(AlertService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);

  formData: FormGroup;

  isEditMode = false;
  formTitle: string = 'Registrar producto';
  formButton: string = 'Crear producto';
  productId: string | null = null;

  existingImages: string[] = []; 
  newImages: File[] = []; 
  newImagePreviews: string[] = [];

  constructor() {

    this.formData = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      nr: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(17)
      ]),
      category: new FormControl('', Validators.required),
      productImage: new FormControl('', Validators.minLength(3)),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(1500),
      ]),
      status: new FormControl('', Validators.required),
      price: new FormControl(0, [Validators.required, Validators.min(1000)]),
      stock: new FormControl(0, [Validators.required, Validators.min(0)]),
      roi: new FormControl(0.3, [Validators.min(0.1)]),
    });
  }

  async onSubmit() {
    if (!this.formData.valid) {
      return;
    }

    const formValue = this.formData.value;

    if (this.isEditMode && this.productId) {
    
      const confirmed = await this.alert.confirmSave('el producto', true);
      if (!confirmed) {
        return;
      }
      const formData = new FormData();

      Object.entries(formValue).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      formData.append('existingImages', JSON.stringify(this.existingImages));
      this.newImages.forEach((file) => formData.append('images', file));

      this.httpProducts.editProduct(this.productId, formData).subscribe({
        next: (data) => {
          console.log(data);
        },
        error: (error) => {
          this.alert.error('No se pudo editar el producto', error.error?.msg);
          console.log(error);
        },
        complete: () => {
          this.alert.success('Guardado!', 'Producto actualizado');
          this.router.navigate(['/dashboard/products']);
        },
      });
    } else {
      if (formValue.productImage == '') {
        delete formValue.productImage;
      }

      const formData = new FormData();
      Object.entries(formValue).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      this.newImages.forEach((file) => formData.append('images', file));

      this.httpProducts.createProducts(formData).subscribe({
        next: (res) => {
          console.log(res);
          this.formData.reset();
          this.newImages = [];
          this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
          this.newImagePreviews = [];
        },

        error: (error) => {
          this.alert.error('No se pudo crear el producto', error.error?.msg);
          console.log(error);
        },

        complete: () => {
          console.log('complete execute');
          this.alert.success('Creado!', 'Producto creado');
          this.router.navigate(['/dashboard/products']);
        },
      });
    }
  }

 
  ngOnInit() {
    this.loadCategories();

    this.productId = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.productId) {
      this.loadProduct(this.productId);
      this.isEditMode = true;
      this.formTitle = 'Editar producto';
      this.formButton = 'Editar';
    }
  }

  loadCategories() {
    this.httpcategory.getCategory().subscribe({
      next: (data) => {
        console.log(data);


        this.categoryList$.next(data.data);
      },

      error: (err) => {
        console.log(err);
      },

      complete: () => {

      },
    });
  }

  loadProduct(productId: string) {
    this.httpProducts.getProductById(productId).subscribe({
      next: (data) => {
        const { product } = data;
        this.formData.patchValue(product);
        this.existingImages = [...(data.product.productImages ?? [])];
      },
      error: () => {},
      complete: () => {},
    });
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const espacioDisponible = 6 - this.totalImages;
    const archivosElegidos = Array.from(input.files).slice(0, espacioDisponible);

    archivosElegidos.forEach((file) => {
      this.newImages.push(file);
      this.newImagePreviews.push(URL.createObjectURL(file));
    });

    input.value = ''; 
  }

  removeNewImage(index: number) {
    URL.revokeObjectURL(this.newImagePreviews[index]); 
    this.newImages.splice(index, 1);
    this.newImagePreviews.splice(index, 1);
  }

  ngOnDestroy() {
    this.newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
  }

  get name() {
    return this.formData.get('name');
  }

  get nr() {
    return this.formData.get('nr');
  }

  get category() {
    return this.formData.get('category');
  }

  get productImage() {
    return this.formData.get('productImage');
  }

  get description() {
    return this.formData.get('description');
  }

  get status() {
    return this.formData.get('status');
  }

  get price() {
    return this.formData.get('price');
  }

  get stock() {
    return this.formData.get('stock');
  }

  get roi() {
    return this.formData.get('roi');
  }

  get totalImages() {
    return this.existingImages.length + this.newImages.length;
  }
}