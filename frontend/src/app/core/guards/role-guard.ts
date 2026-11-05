import { CanActivateFn, Router } from '@angular/router';
import { HttpAuth } from '../services/http-auth';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(HttpAuth);
  const router = inject(Router);

  const allowedRoles: string[] = route.data?.['roles'] || [];

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  const currentUser = authService.user;
  console.log(currentUser)
  const userRole = typeof currentUser?.rol === 'object' ? currentUser?.role?.name : currentUser?.rol;
  const isAuthorized = userRole && allowedRoles.some(
    (role) => role.toLowerCase() === String(userRole).toLowerCase()
  );
  if (isAuthorized) {
    return true;
  }

  console.warn(`⛔ [RoleGuard] Acceso denegado a '${state.url}'. El rol '${userRole}' no cuenta con permisos. Roles autorizados:`, allowedRoles);

  router.navigate(['/home']);
  return false;
};
