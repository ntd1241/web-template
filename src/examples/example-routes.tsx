import { lazy, Suspense, type ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { Route } from 'react-router';
import { MainLayout } from '@/components/layouts/main-layout';
import { PublicLayout } from '@/components/layouts/public-layout';
import { ScreenLoader } from '@/components/screen-loader';

/**
 * Điểm đăng ký DUY NHẤT cho mọi trang example.
 *
 * Cả khối `import()` nằm trong `if (import.meta.env.DEV)` nên ở production build,
 * `import.meta.env.DEV` = `false` → toàn bộ bị dead-code-eliminated: KHÔNG có
 * chunk example nào trong `dist/`. Ở dev thì lazy-load bình thường.
 *
 * Gỡ toàn bộ example: xóa thư mục `src/examples/` và dòng `{exampleRoutes}` (cùng
 * import của nó) trong `src/routing/app-routing-setup.tsx`.
 */
let exampleRoutes: ReactNode = null;

if (import.meta.env.DEV) {
  const EmployeesExamplePage = lazy(() =>
    import('./employees/pages/employees-page').then((m) => ({
      default: m.EmployeesExamplePage,
    })),
  );
  const OrdersExamplePage = lazy(() =>
    import('./orders/pages/orders-page').then((m) => ({
      default: m.OrdersExamplePage,
    })),
  );
  const OrderEditPage = lazy(() =>
    import('./orders/pages/order-edit-page').then((m) => ({
      default: m.OrderEditPage,
    })),
  );
  const RolePermissionsPage = lazy(() =>
    import('./role-permissions/pages/role-permissions-page').then((m) => ({
      default: m.RolePermissionsPage,
    })),
  );
  const MaterialsManagementPage = lazy(() =>
    import('./material/pages/materials-management-page').then((m) => ({
      default: m.MaterialsManagementPage,
    })),
  );
  const SuppliersPage = lazy(() =>
    import('./suppliers/pages/suppliers-page').then((m) => ({
      default: m.SuppliersPage,
    })),
  );
  const MaterialPublicDetailPage = lazy(() =>
    import('./material/public-detail/pages/material-public-detail-page').then(
      (m) => ({
        default: m.MaterialPublicDetailPage,
      }),
    ),
  );

  // Greybox/wireframe — rendered INSIDE MainLayout so the real shell (sidebar +
  // topbar) surrounds it; the greybox only blocks out the page content area.
  const RolePermissionsWireframe = lazy(() =>
    import('./role-permissions/wireframe').then((m) => ({
      default: m.RolePermissionsWireframe,
    })),
  );

  exampleRoutes = (
    <>
      <Route element={<MainLayout />}>
        <Route
          path={ROUTES.EXAMPLE.EMPLOYEES}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <EmployeesExamplePage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.EXAMPLE.ORDERS}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <OrdersExamplePage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.EXAMPLE.ORDER_EDIT}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <OrderEditPage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.EXAMPLE.MATERIALS}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <MaterialsManagementPage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.EXAMPLE.SUPPLIERS}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <SuppliersPage />
            </Suspense>
          }
        />
        <Route
          path={ROUTES.EXAMPLE.ROLE_PERMISSIONS}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <RolePermissionsPage />
            </Suspense>
          }
        />
        <Route
          path="/example/role-permissions/wireframe"
          element={
            <Suspense fallback={<ScreenLoader />}>
              <RolePermissionsWireframe />
            </Suspense>
          }
        />
      </Route>
      <Route element={<PublicLayout />}>
        <Route
          path={ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL}
          element={
            <Suspense fallback={<ScreenLoader />}>
              <MaterialPublicDetailPage />
            </Suspense>
          }
        />
      </Route>
    </>
  );
}

export { exampleRoutes };
