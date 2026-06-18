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
    MATERIALS: '/example/materials',
    MATERIAL_PUBLIC_DETAIL: '/example/materials/public/:id',
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
