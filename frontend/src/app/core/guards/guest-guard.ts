import { inject} from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpAuth } from '../services/http-auth';
import { map, tap } from 'rxjs';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(HttpAuth)
  const router = inject(Router)

return authService.checkAuthStatus().pipe(
    map((isAuthenticated) => !isAuthenticated), 
    tap((isGuest) => {
      if (!isGuest) {
        console.info('ℹ️ [GuestGuard] El usuario ya cuenta con una sesión activa. Redirigiendo a /dashboard...');
        router.navigate(['/dashboard']);
      }
    })
  );

};
