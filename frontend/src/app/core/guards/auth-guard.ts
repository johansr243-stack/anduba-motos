import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpAuth } from '../services/http-auth';
import { tap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(HttpAuth);
  const router = inject(Router);

  return authService.checkAuthStatus().pipe(
    tap((isAuthenticated) => {
      if (!isAuthenticated) {
        console.warn(
          '🔒 [AuthGuard] Acceso bloqueado. Sesión expirada o token inválido. Redirigiendo a /login...',
        );
        router.navigate(['/login']);
      }
    }),
  );
};
