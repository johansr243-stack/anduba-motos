import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './http-cart';

@Service()
export class HttpAuth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cartService = inject(CartService);
  private BASE_URL = environment.apiUrl;

  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private currentUser$ = new BehaviorSubject<any>(this.getUserFromStorage());
  private token$ = new BehaviorSubject<string | null>(this.getTokenFromStorage());

  user$ = this.currentUser$.asObservable();
  tokenObservable$ = this.token$.asObservable();

  login(username: string, password: string) {
    return this.http.post<any>(`${this.BASE_URL}/auth/login`, { username, password }).pipe(
      tap((res) => {
        if (res?.token && res?.data) {
          this.setAuthData(res.token, res.data);
          this.cartService.loadCart(); 

          this.router.navigateByUrl(this.isStaffRole(res.data.rol) ? '/dashboard' : '/home');
        }
      }),
      map((res) => res.msg),
      catchError((err: HttpErrorResponse) => {
        !err.error?.msg ? (err.error.msg = 'No se pudo iniciar sesión') : console.log('si viene');

        console.log(err.error?.msg);

        return throwError(() => err);
      }),
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.BASE_URL}/auth/register`, data).pipe(
      tap((res) => {
        console.log('registrado');
      }),
      catchError((err: HttpErrorResponse) => {
        if (!err.error?.msg) {
          err.error.msg = 'No se pudo completar el registro';
        }
        return throwError(() => err);
      }),
    );
  }

  setAuthData(token: string, user: any) {
    this.token = token;
    this.user = user;
  }

  private getTokenFromStorage(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private getUserFromStorage(): string | null {
    if (this.isBrowser) {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  clearAuthData(): void {
    this.token = null;
    this.user = null;
  }

  isLogged(): boolean {
    return !!this.token && !!this.user;
  }
  isStaffRole(rol: string): boolean {
    return rol === 'admin' || rol === 'owner' || rol === 'employee';
  }

  logoutUser(): void {
    this.cartService.clearLocal(); 
    this.clearAuthData();
    this.router.navigateByUrl('/home');
  }
  checkAuthStatus(): Observable<boolean> {
    const token = this.token;
    if (!token) {
      this.clearAuthData();
      return of(false);
    }

    return this.http.get<any>(`${this.BASE_URL}/auth/renew-token`).pipe(
      tap((res) => {
        if (res?.token && res?.data) {
          this.setAuthData(res.token, res.data);
        }
      }),
      map((res) => !!res?.token),
      catchError((err: HttpErrorResponse) => {
        console.error('💥 Error al renovar token en Backend:', err);
        this.clearAuthData();
        return of(false);
      }),
    );
  }

  forgotPassword(data:any){
   return this.http.post<any>(`${this.BASE_URL}/auth/forgot-password`, data).pipe(tap((res)=>{console.log(res); console.log(data)}))
  }

  validateCode(data:any){
    return this.http.post<any>(`${this.BASE_URL}/auth/verify-reset-code`, data).pipe(tap((res)=>{console.log(res); console.log(data)}))
    
  }
   resetPassword(data:any){
    return this.http.post<any>(`${this.BASE_URL}/auth/reset-password`, data).pipe(tap((res)=>{console.log(res); console.log(data)}))
   }
  

  set token(token: string | null) {
    if (this.isBrowser) {
      if (token) {
        localStorage.setItem(this.TOKEN_KEY, token);
      } else {
        localStorage.removeItem(this.TOKEN_KEY);
      }
    }
    this.token$.next(token);
    console.log('[Setter Token]:', token);
  }

  set user(user: any) {
    if (this.isBrowser) {
      if (user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.USER_KEY);
      }
    }
    this.currentUser$.next(user);
    console.log('[Setter User]:', user);
  }

  get token(): string | null {
    return this.token$.getValue();
  }

  get user(): any {
    return this.currentUser$.getValue();
  }
}
