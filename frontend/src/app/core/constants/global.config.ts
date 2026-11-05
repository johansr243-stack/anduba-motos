
export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  EMPLOYEE: "employee",
  CLIENT: "client",
} as const

export const ALLOWED_ROLES = Object.values(ROLES);

export const CONFIRMED_ORDER_STATUSES = ["paid", "shipped", "delivered"];

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Dueño',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.EMPLOYEE]: 'Empleado',
  [ROLES.CLIENT]: 'Cliente',

}
