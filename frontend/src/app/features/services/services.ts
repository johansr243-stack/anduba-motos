import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpServices } from '../../core/services/http-services';
import { ServiceItem } from '../../core/models/Service';
import { HttpAuth } from '../../core/services/http-auth';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-services',
  imports: [CurrencyPipe, RouterLink, AsyncPipe, ImageUrlPipe],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export default class Services implements OnInit {
  private httpServices = inject(HttpServices);
  private router = inject(Router);
  private httpAuth = inject(HttpAuth);
  currentUser$ = this.httpAuth.user$;

  canManageServices(user: any): boolean {
    return user?.rol === 'admin' || user?.rol === 'owner';
  }

  services = signal<ServiceItem[]>([]);
  expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServices();
  }

  private loadServices(): void {
    this.httpServices.getServices().subscribe({
      next: (data) => this.services.set(data),
      error: (error) => console.error(error),
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=800&auto=format&fit=crop';
  }

  toggleExpanded(serviceId: string): void {
    this.expandedId.set(this.expandedId() === serviceId ? null : serviceId);
  }

  onBookService(serviceId: string): void {
    this.router.navigate(['/contact'], { queryParams: { serviceId } });
  }
}
