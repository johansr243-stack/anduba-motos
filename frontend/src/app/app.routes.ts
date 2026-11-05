import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import Services from './features/services/services';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import {  ROLES } from './core/constants/global.config';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'home', component: Home },
  {
    path: 'login',
    canActivate:[guestGuard],
    loadComponent: () => import('./features/login/login'),
  },
  {
    path: 'register',
    canActivate:[guestGuard],
    loadComponent: () => import('./features/register/register'),
  },
  {
    path: '404',
    loadComponent: () => import('./features/page-not-found/page-not-found'),
  },

  {
    path: 'dashboard',
    data:{roles:[ROLES.ADMIN, ROLES.OWNER, ROLES.EMPLOYEE]},
    canActivate:[authGuard, roleGuard],
    loadComponent: () => import('./features/dashboard/dashboard'),
    children: [
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list'),
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/users/user-form/user-form'),
      },
      {
        path: 'users/edit/:id',
        loadComponent: () => import('./features/users/user-form/user-form'),
      },

      {
        path: 'products',
        loadComponent: () => import('./features/products/product-list/product-list'),
      },
      {
        path: 'products/new',
        loadComponent: () => import('./features/products/product-form/product-form'),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./features/products/product-form/product-form'),
      },
      {
        path: 'motorcycles',
        loadComponent: () => import('./features/motorcycles/motorcycle-list/motorcycle-list'),
      },
      {
        path: 'motorcycles/new',
        loadComponent: () => import('./features/motorcycles/motorcycle-form/motorcycle-form'),
      },
      {
        path: 'motorcycles/edit/:id',
        loadComponent: () => import('./features/motorcycles/motorcycle-form/motorcycle-form'),
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/categories/categories-list/categories-list'),
      },

      {
        path: 'categories/new',
        loadComponent: () => import('./features/categories/category-form/category-form'),
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./features/categories/category-form/category-form'),
      },
      {
        path: 'reports',
        loadComponent: () => import('./features/reports/sales-report/sales-report'),
      },
      {
        path: 'carts',
        loadComponent: () => import('./features/cart/cart-list/cart-list'),
      },
      {
        path: 'service-records',
        loadComponent: () =>
          import('./features/service-records/service-record-list/service-record-list'),
      },
      {
        path: 'service-records/new',
        loadComponent: () =>
          import('./features/service-records/service-record-form/service-record-form'),
      },
      {
        path: 'service-records/edit/:id',
        loadComponent: () =>
          import('./features/service-records/service-record-form/service-record-form'),
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/order/order-list/order-list'),
      },
      {
        path: 'orders/new',
        loadComponent: () => import('./features/order/order-form/order-form'),
      },
      {
        path: 'orders/edit/:id',
        loadComponent: () => import('./features/order/order-form/order-form'),
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/appointment/appointment-list/appointment-list'),
      },
      {
        path: 'appointments/edit/:id',
        loadComponent: () =>
          import('./features/appointment/appointment-form/appointment-form'),
      },
      {
        path: 'services/new',
        loadComponent: () => import('./features/services/service-form/service-form'),
      },
      {
        path: 'services/edit/:id',
        loadComponent: () => import('./features/services/service-form/service-form'),
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history'),
      },
      {
        path: 'history/:userId',
        loadComponent: () => import('./features/history/history-detail/history-detail'),
      },
    ],
  },

  {
    path: 'brochure',
    loadComponent: () => import('./features/brochure/brochure'),
  },

  {
    path: 'about-us',
    loadComponent: () => import('./features/about-us/about-us'),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact'),
  },

  {
    path: 'services',
    loadComponent: () => import('./features/services/services'),
  },

  {
    path: 'appointment',
    loadComponent: () => import('./features/appointment/appointment-form/appointment-form'),
  },

  {
    path: 'motorcycles/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/motorcycles/motorcycle-form-client/motorcycle-form-client'),
  },

  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout'),
  },
  {
    path: 'my-account',
    canActivate:[authGuard],
    loadComponent: () => import('./features/my-account/my-account'),
  },{
    path:'forgot-password',
    loadComponent:()=>  import('./features/reset-password/reset-password')
  },

  //Redirecciones
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: '404', pathMatch: 'full' },
];