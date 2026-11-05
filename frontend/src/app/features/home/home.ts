import { Component, ElementRef, HostListener, inject, input, ViewChild } from '@angular/core';
import { RouterLink } from "@angular/router";
import { ProductHomeCard } from '../products/product-home-card/product-home-card';
import { HttpProducts } from '../../core/services/http-products';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductHomeCard, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  httpProducts = inject(HttpProducts)

  products$ = new BehaviorSubject<any[]>([])


   @ViewChild('heroBg') heroBg?: ElementRef<HTMLElement>;

  private ticking = false;
  private reducedMotion = false;
  private readonly speed = 0.5;

  ngAfterViewInit() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngOnInit(){
    this.httpProducts.getProducts().subscribe({next:(data)=>{ console.log(data);this.products$.next(data.slice(0,5))}})
    
  }

  @HostListener('window:scroll')
  onScroll() {
    if (this.reducedMotion || this.ticking || !this.heroBg) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const heroHeight = this.heroBg!.nativeElement.parentElement?.clientHeight ?? window.innerHeight;
      const clampedScroll = Math.min(window.scrollY, heroHeight);
      const offset = clampedScroll * this.speed;
      this.heroBg!.nativeElement.style.transform = `translate3d(0, ${offset}px, 0)`;
      this.ticking = false;
    });
  }

}

