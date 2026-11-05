import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/http-cart';
import { AlertService } from '../../../core/services/alert';
import { HttpAuth } from '../../../core/services/http-auth';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'product-brochure-card',
  imports: [UpperCasePipe, CurrencyPipe, ImageUrlPipe],
  templateUrl: './product-brochure-card.html',
  styleUrl: './product-brochure-card.css',
})
export class ProductBrochureCard {
  cartService = inject(CartService);
  alert = inject(AlertService)
  private httpAuth = inject(HttpAuth);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  @Input() product: any;

  @Output() open = new EventEmitter<{ product: any; rect: DOMRect }>();

  justAdded = false;
  private addedTimeout?: ReturnType<typeof setTimeout>;

  constructor(private elRef: ElementRef<HTMLElement>) { }

  onCardClick() {
    const rect = this.elRef.nativeElement.getBoundingClientRect();
    this.open.emit({ product: this.product, rect });
  }

  addToCart(event: Event) {
    event.stopPropagation();

    if (!this.httpAuth.isLogged()) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.addItem(this.product._id, 1).subscribe({
      next: () => {
        this.justAdded = true;
        this.cdr.detectChanges();
        clearTimeout(this.addedTimeout);
        this.addedTimeout = setTimeout(() => {
          this.justAdded = false;
          this.cdr.detectChanges();
        }, 400);
      },
      error: (err) => {
        console.error(err.error?.msg);
        this.alert.error('No se pudo añadir al carrito', err.error?.msg)
      },
    });
  }

  ngOnDestroy() {
    clearTimeout(this.addedTimeout);
  }
}