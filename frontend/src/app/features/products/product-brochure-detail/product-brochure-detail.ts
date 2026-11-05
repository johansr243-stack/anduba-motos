import { CurrencyPipe, TitleCasePipe, UpperCasePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CartService } from '../../../core/services/http-cart';
import { AlertService } from '../../../core/services/alert';
import { HttpAuth } from '../../../core/services/http-auth';
import { Router } from '@angular/router';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'product-brochure-detail',
  imports: [CurrencyPipe, UpperCasePipe, ImageUrlPipe],
  templateUrl: './product-brochure-detail.html',
  styleUrl: './product-brochure-detail.css',
})
export class ProductBrochureDetail implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  cartService = inject(CartService)
  alert = inject(AlertService)
  private httpAuth = inject(HttpAuth);
  private router = inject(Router);
  @Input() product: any;

  @Input() originRect: DOMRect | null = null;
  @Output() close = new EventEmitter<void>();

  @ViewChild('panel') panelRef!: ElementRef<HTMLElement>;

  currentImage = 0;
  isOpen = false;
  isAnimating = false;
  showContent = false;
  private isClosing = false;

  justAdded = false;
  private addedTimeout?: ReturnType<typeof setTimeout>;

  addToCart() {
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

  get images(): string[] {
    return this.product?.productImages?.length ? this.product.productImages : [];
  }

  get hasMultipleImages(): boolean {
    return this.images.length > 1;
  }

  ngAfterViewInit() {
    this.playOpenAnimation();
  }

  private playOpenAnimation() {
    const panel = this.panelRef.nativeElement;

    if (!this.originRect) {
      this.isOpen = true;
      this.showContent = true;
      this.cdr.detectChanges();
      return;
    }

    this.isOpen = true;
    this.isAnimating = true;
    this.cdr.detectChanges();

    const finalRect = panel.getBoundingClientRect();

    panel.style.transition = 'none';
    panel.style.position = 'fixed';
    panel.style.margin = '0';
    panel.style.left = `${this.originRect.left}px`;
    panel.style.top = `${this.originRect.top}px`;
    panel.style.width = `${this.originRect.width}px`;
    panel.style.height = `${this.originRect.height}px`;
    panel.style.borderRadius = '14px';

    void panel.offsetWidth;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bezier = 'cubic-bezier(0.16, 1, 0.3, 1)';
        const duration = '0.45s';
        panel.style.transition = `left ${duration} ${bezier}, top ${duration} ${bezier}, width ${duration} ${bezier}, height ${duration} ${bezier}, border-radius ${duration} ease, grid-template-columns ${duration} ${bezier}`;

        panel.style.left = `${finalRect.left}px`;
        panel.style.top = `${finalRect.top}px`;
        panel.style.width = `${finalRect.width}px`;
        panel.style.height = `${finalRect.height}px`;
        panel.style.borderRadius = '20px';

        panel.classList.remove('is-animating');
        this.showContent = true;
        this.cdr.detectChanges();

        setTimeout(() => {
          if (!this.isClosing) {
            panel.style.transition = '';
            panel.style.position = '';
            panel.style.left = '';
            panel.style.top = '';
            panel.style.width = '';
            panel.style.height = '';
            panel.style.margin = '';
            panel.style.borderRadius = '';

            this.isAnimating = false;
          }
        }, 500);
      });
    });
  }

  requestClose() {
    if (this.isClosing) return;
    this.isClosing = true;

    this.showContent = false;
    this.isAnimating = true;
    this.cdr.detectChanges();

    const panel = this.panelRef?.nativeElement;

    if (panel && this.originRect) {
      const currentRect = panel.getBoundingClientRect();

      panel.style.transition = 'none';
      panel.style.position = 'fixed';
      panel.style.margin = '0';
      panel.style.left = `${currentRect.left}px`;
      panel.style.top = `${currentRect.top}px`;
      panel.style.width = `${currentRect.width}px`;
      panel.style.height = `${currentRect.height}px`;

      void panel.offsetWidth;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.isOpen = false;
          this.showContent = false;
          this.cdr.detectChanges();

          panel.classList.add('is-animating');

          const bezier = 'cubic-bezier(0.16, 1, 0.3, 1)';
          const duration = '0.4s';
          panel.style.transition = `left ${duration} ${bezier}, top ${duration} ${bezier}, width ${duration} ${bezier}, height ${duration} ${bezier}, border-radius ${duration} ease, grid-template-columns ${duration} ${bezier}`;
          panel.style.left = `${this.originRect!.left}px`;
          panel.style.top = `${this.originRect!.top}px`;
          panel.style.width = `${this.originRect!.width}px`;
          panel.style.height = `${this.originRect!.height}px`;
          panel.style.borderRadius = '14px';
        });
      });
    } else {
      this.isOpen = false;
      this.cdr.detectChanges();
    }

    setTimeout(() => this.close.emit(), 400);
  }

  onBackdropClick() {
    this.requestClose();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.requestClose();
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight() {
    this.nextImage();
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft() {
    this.prevImage();
  }

  nextImage() {
    if (!this.hasMultipleImages) return;
    this.currentImage = (this.currentImage + 1) % this.images.length;
  }

  prevImage() {
    if (!this.hasMultipleImages) return;
    this.currentImage = (this.currentImage - 1 + this.images.length) % this.images.length;
  }

  goToImage(i: number) {
    this.currentImage = i;
  }

  displayPrice(): number {
    return this.product.price + this.product.price * (this.product.roi ?? 0);
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    clearTimeout(this.addedTimeout);
  }
}