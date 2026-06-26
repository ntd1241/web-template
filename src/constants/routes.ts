/**
 * Tập trung path routes — không hardcode string path trong component.
 * Khi thêm trang mới, khai báo path ở đây và đăng ký trong
 * `src/routing/app-routing-setup.tsx`.
 */
export const ROUTES = {
  HOME: '/',
  EXAMPLE: {
    EMPLOYEES: '/example/employees',
    EMPLOYEE_DETAIL: '/example/employees/:id',
    ORDERS: '/example/orders',
    ORDER_EDIT: '/example/orders/edit',
    MATERIALS: '/example/materials',
    MATERIAL_CREATE: '/example/materials/new',
    MATERIAL_EDIT: '/example/materials/:id/edit',
    MATERIAL_SPECS: '/example/materials/specs',
    MATERIAL_GROUPS: '/example/materials/groups',
    MATERIAL_INSPECTIONS: '/example/materials/inspections',
    MATERIAL_MODELS: '/example/materials/models',
    MATERIAL_MODEL_CREATE: '/example/materials/models/new',
    MATERIAL_MODEL_EDIT: '/example/materials/models/:id/edit',
    MATERIAL_PUBLIC_DETAIL: '/example/materials/public/:id',
    SUPPLIERS: '/example/suppliers',
    ROLE_PERMISSIONS: '/example/role-permissions',
    OPERATIONS_DASHBOARD: '/example/operations-dashboard',
  },
} as const;

/** Thay thế param `:key` trong path. buildPath(ROUTES.EXAMPLE.EMPLOYEE_DETAIL, { id }) */
export function buildPath(
  path: string,
  params: Record<string, string>,
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    path,
  );
}
