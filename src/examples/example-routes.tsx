import { lazy, Suspense, type ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { Route } from 'react-router';
import { MainLayout } from '@/components/layouts/main-layout';
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

  exampleRoutes = (
    <Route element={<MainLayout />}>
      <Route
        path={ROUTES.EXAMPLE.EMPLOYEES}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <EmployeesExamplePage />
          </Suspense>
        }
      />
    </Route>
  );
}

export { exampleRoutes };
