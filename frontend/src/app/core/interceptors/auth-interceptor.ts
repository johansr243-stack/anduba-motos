import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpAuth } from '../services/http-auth';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const httpAuth = inject(HttpAuth);

  const router = inject(Router);

  const token = httpAuth.token;
  // const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Token: token } })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status == 401) {
        httpAuth.clearAuthData();

        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
