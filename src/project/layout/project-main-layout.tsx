import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { PROJECT_MENU_GROUPS } from '@/config/project-menu.config';
import { MainLayout } from '@/components/layouts/main-layout';
import { loadProjectContext } from '../api/project-context.api';

export function ProjectMainLayout() {
  const { pathname } = useLocation();
  const userId = useAuthStore((state) => state.user?.id);
  const contextQuery = useQuery({
    queryKey: ['project', 'context', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadProjectContext(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const tenantName = contextQuery.data?.tenantName ?? 'Đang tải tenant...';
  const accountRoles = contextQuery.data?.roleNames ?? [];
  const breadcrumbCurrent =
    pathname === ROUTES.PROJECT.EMPLOYEES
      ? 'Nhân viên'
      : pathname === ROUTES.PROJECT.CUSTOMERS
        ? 'Khách hàng'
        : pathname === ROUTES.PROJECT.SETTINGS
          ? 'Cài đặt'
          : pathname === ROUTES.PROJECT.ROLE_PERMISSIONS
            ? 'Phân quyền'
            : pathname === ROUTES.PROJECT.TAGS
              ? 'Nhãn'
              : 'Tổng quan';

  return (
    <MainLayout
      shell={{
        menuGroups: PROJECT_MENU_GROUPS,
        homePath: '/',
        brandName: 'Vacom CRM',
        headerTitle: tenantName,
        accountRoles,
        breadcrumbRootLabel: 'Trang chủ',
        breadcrumbRootPath: '/',
        breadcrumbCurrent,
      }}
    />
  );
}
