import { Component, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { HttpProducts } from '../../core/services/http-products';
import { HttpCategories } from '../../core/services/http-categories';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe, CurrencyPipe, UpperCasePipe} from '@angular/common';
import { ProductBrochureCard } from '../products/product-brochure-card/product-brochure-card';
import { ProductBrochureDetail } from '../products/product-brochure-detail/product-brochure-detail';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-brochure',
  imports: [ AsyncPipe, ProductBrochureCard, ProductBrochureDetail, FontAwesomeModule],
  templateUrl: './brochure.html',
  styleUrl: './brochure.css',
})
export  default class Brochure {
  faPlus = faPlus;

  private httpProducts = inject(HttpProducts)
  private httpCategories = inject(HttpCategories)
  products$ = new BehaviorSubject<any[]>([])
  filteredProducts$ = new BehaviorSubject<any[]>([])

  // Todas las categorías que llegan del backend.
  // Antes era un array plano (allCategories) y la vista no siempre se
  // refrescaba al llegar la respuesta del backend al navegar entre páginas.
  // Con BehaviorSubject + async pipe, Angular sí detecta el cambio siempre.
  categories$ = new BehaviorSubject<any[]>([]);
  // Cuántas se muestran como botón fijo afuera; el resto va al desplegable del "+"
  private readonly MAIN_CATEGORIES_COUNT = 3;

  mainCategories$ = this.categories$.pipe(map((cats) => cats.slice(0, this.MAIN_CATEGORIES_COUNT)));
  extraCategories$ = this.categories$.pipe(map((cats) => cats.slice(this.MAIN_CATEGORIES_COUNT)));

  categoryFilter: string = ''; // '' = "Todos"
  showMoreCategories = false;
  moreCategoriesPos = { top: 0, left: 0 };

  @ViewChild('moreCategoriesWrapper') moreCategoriesWrapper?: ElementRef<HTMLElement>;

  selectedProduct: any = null;
  originRect: DOMRect | null = null;

  ngOnInit(){
    this.httpProducts.getProducts().subscribe(
      {next: (products)=>{
        this.products$.next(products)
        this.applyFilters();
      },
      error: (error)=> {
        console.log(error)
      },
      complete: ()=>{
        console.log('Se trajeron los datos')
      }
    }

    )

    this.httpCategories.getCategory().subscribe({
      next: (res) => {
        this.categories$.next(res.data ?? []);
      },
      error: (error) => console.log(error),
    });
  }

  isExtraCategorySelected(extraCategories: any[]): boolean {
    if (!this.categoryFilter) return false;
    return extraCategories.some((c) => c._id === this.categoryFilter);
  }

  toggleMoreCategories() {
    this.showMoreCategories = !this.showMoreCategories;
    if (this.showMoreCategories && this.moreCategoriesWrapper) {
      const rect = this.moreCategoriesWrapper.nativeElement.getBoundingClientRect();
      // Coordenadas de viewport porque el dropdown ahora es position: fixed
      // y vive fuera de .brochure-header, así ya no depende del contexto
      // de apilamiento del sticky/backdrop-filter del header.
      this.moreCategoriesPos = {
        top: rect.bottom + 8,
        left: rect.right - 170, // 170px = min-width del dropdown, alineado a la derecha del botón
      };
    }
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange() {
    // Si el usuario hace scroll o cambia el tamaño de la ventana con el
    // dropdown abierto, lo cerramos en vez de dejarlo desalineado del botón.
    if (this.showMoreCategories) {
      this.showMoreCategories = false;
    }
  }

  selectCategory(categoryId: string) {
    this.categoryFilter = categoryId;
    this.showMoreCategories = false;
    this.applyFilters();
  }

  applyFilters() {
    const result = this.products$.value.filter((p) => {
      const isVisible = p.status !== 'no disponible' && p.status !== 'agotado';
      const matchesCategory = !this.categoryFilter || p.category === this.categoryFilter;
      return isVisible && matchesCategory;
    });
    this.filteredProducts$.next(result);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const clickedInsideDropdown = target.closest('.category-more-list') !== null;
    if (
      this.showMoreCategories &&
      this.moreCategoriesWrapper &&
      !this.moreCategoriesWrapper.nativeElement.contains(target) &&
      !clickedInsideDropdown
    ) {
      this.showMoreCategories = false;
    }
  }

  onOpenDetail(event: { product: any; rect: DOMRect }) {
    this.originRect = event.rect;
    this.selectedProduct = event.product;
    document.body.style.overflow = 'hidden';
  }

  onCloseDetail() {
    this.selectedProduct = null;
    this.originRect = null;
    document.body.style.overflow = '';
  }
}