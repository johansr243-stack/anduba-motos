import { Component, inject, MAX_ANIMATION_TIMEOUT } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { HttpAuth } from '../../core/services/http-auth';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUsers,
  faBoxesStacked,
  faTags,
  faMotorcycle,
  faArrowRight,
  faChartLine,
  faClipboardList,
  faWrench,
  faCalendarCheck,
  faClockRotateLeft,
  faGear,
  faCartShopping,
} from '@fortawesome/free-solid-svg-icons';

interface DashboardSection {
  label: string;
  description: string;
  route: string;
  icon: any;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, AsyncPipe, FontAwesomeModule, RouterOutlet],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export default class Dashboard {
  httpAuth = inject(HttpAuth);
  private route = inject(ActivatedRoute);
  faArrowRight = faArrowRight;

  // Si al entrar al Dashboard la ruta YA trae un hijo activo (ej: se navegó
  // directo a /dashboard/services/new desde afuera del dashboard), hay que
  // arrancar mostrando el <router-outlet> en vez del grid. Si arrancara
  // siempre en `true`, el outlet no existiría todavía en el DOM y Angular
  // no tendría dónde montar el componente hijo (por eso los botones de
  // "nuevo" y "editar" en /services no hacían nada).
  routeChange = !this.route.snapshot.firstChild;

  mainRoute = '/dashboard'


  sections: DashboardSection[] = [
    {
      label: 'Usuarios',
      description: 'Clientes, empleados y cuentas del taller.',
      route: this.mainRoute +'/users',
      icon: faUsers,
    },
    {
      label: 'Productos',
      description: 'Catálogo de repuestos y accesorios en venta.',
      route: this.mainRoute +'/products',
      icon: faBoxesStacked,
    },
    {
      label: 'Categorías',
      description: 'Organiza el catálogo por tipo de producto.',
      route: this.mainRoute +'/categories',
      icon: faTags,
    },
    {
      label: 'Motocicletas',
      description: 'Motos registradas y su cliente asociado.',
      route: this.mainRoute +'/motorcycles',
      icon: faMotorcycle,
    },
    {
      label: 'Carritos',
      description: 'Carritos de compra activos de todos los clientes.',
      route: this.mainRoute +'/carts',
      icon: faCartShopping,
    },
    {
      label: 'Órdenes',
      description: 'Órdenes de compra de productos.',
      route: this.mainRoute +'/orders',
      icon: faClipboardList,
    },
    {
      label: 'Registros de servicio',
      description: 'Trabajos realizados en el taller.',
      route: this.mainRoute +'/service-records',
      icon: faWrench,
    },
    {
      label: 'Citas',
      description: 'Agenda y gestiona las citas de los clientes.',
      route: this.mainRoute +'/appointments',
      icon: faCalendarCheck,
    },
    {
      label: 'Servicios',
      description: 'Catálogo de servicios que ofrece el taller.',
      route: '/services',
      icon: faGear,
    },
    {
      label: 'Historial de clientes',
      description: 'Servicios y compras realizadas por cada cliente.',
      route: this.mainRoute +'/history',
      icon: faClockRotateLeft,
    },
    {
      label: 'Ventas y ganancias',
      description: 'Estado de ventas, ganancias y artículos vendidos.',
      route: this.mainRoute +'/reports',
      icon: faChartLine,
    },
  ];

  changeRoute(){
    this.routeChange = false
  }
}