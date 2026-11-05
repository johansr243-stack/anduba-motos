
export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CLIENT: "client",
};

export const ALLOWED_ROLES = Object.values(ROLES);

// Estados de orden que cuentan como venta ya confirmada (para el panel
// de ventas). "pending" no entra acá porque todavía no se ha pagado.
export const CONFIRMED_ORDER_STATUSES = ["paid", "shipped", "delivered"];

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Dueño',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.EMPLOYEE]: 'Empleado',
  [ROLES.CLIENT]: 'Cliente',

}


