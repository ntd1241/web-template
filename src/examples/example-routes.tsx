import { lazy, Suspense, type ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { Route } from 'react-router';
import { MainLayout } from '@/components/layouts/main-layout';
import { PublicLayout } from '@/components/layouts/public-layout';
import { ScreenLoader } from '@/components/screen-loader';

/**
 * Điểm đăng ký DUY NHẤT cho mọi trang example.
 *
 * Gỡ toàn bộ example: xóa thư mục `src/examples/` và dòng `{exampleRoutes}` (cùng
 * import của nó) trong `src/routing/app-routing-setup.tsx`.
 */
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
const MaterialEditorPage = lazy(() =>
  import('./material/pages/material-editor-page').then((m) => ({
    default: m.MaterialEditorPage,
  })),
);
const SuppliersPage = lazy(() =>
  import('./suppliers/pages/suppliers-page').then((m) => ({
    default: m.SuppliersPage,
  })),
);
const SpecDefinitionsPage = lazy(() =>
  import('./material/specs/pages/spec-definitions-page').then((m) => ({
    default: m.SpecDefinitionsPage,
  })),
);
const MaterialGroupsPage = lazy(() =>
  import('./material/groups/pages/material-groups-page').then((m) => ({
    default: m.MaterialGroupsPage,
  })),
);
const InspectionTablesPage = lazy(() =>
  import('./material/inspection/pages/inspection-tables-page').then((m) => ({
    default: m.InspectionTablesPage,
  })),
);
const MaterialModelsPage = lazy(() =>
  import('./material/models/pages/material-models-page').then((m) => ({
    default: m.MaterialModelsPage,
  })),
);
const MaterialModelEditorPage = lazy(() =>
  import('./material/models/pages/material-model-editor-page').then((m) => ({
    default: m.MaterialModelEditorPage,
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
const MaterialModelSpecWireframe = lazy(() =>
  import('./material/models/wireframe').then((m) => ({
    default: m.MaterialModelSpecWireframe,
  })),
);

const exampleRoutes: ReactNode = (
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
        path={ROUTES.EXAMPLE.MATERIAL_CREATE}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialEditorPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_EDIT}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialEditorPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_SPECS}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <SpecDefinitionsPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_GROUPS}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialGroupsPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_INSPECTIONS}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <InspectionTablesPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_MODELS}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialModelsPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_MODEL_CREATE}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialModelEditorPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.EXAMPLE.MATERIAL_MODEL_EDIT}
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialModelEditorPage />
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
      <Route
        path="/example/material/models/wireframe"
        element={
          <Suspense fallback={<ScreenLoader />}>
            <MaterialModelSpecWireframe />
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

export { exampleRoutes };
