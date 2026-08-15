import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { PROJECT_MENU_GROUPS } from '@/config/project-menu.config';
import { MainLayout } from '@/components/layouts/main-layout';
import { loadProjectContext } from '../api/project-context.api';
import { loadContractDetail } from '../contracts/api/contracts.api';
import { loadCustomerDetail } from '../customers/api/customers.api';

export function ProjectMainLayout() {
  const { pathname } = useLocation();
  const userId = useAuthStore((state) => state.user?.id);
  const isCustomerDetail = pathname.startsWith(`${ROUTES.PROJECT.CUSTOMERS}/`);
  const isContractDetail =
    pathname.startsWith(`${ROUTES.PROJECT.CONTRACTS}/`) &&
    pathname !== ROUTES.PROJECT.CONTRACT_CREATE;
  const customerId = isCustomerDetail
    ? pathname.slice(`${ROUTES.PROJECT.CUSTOMERS}/`.length).split('/')[0]
    : undefined;
  const contractId = isContractDetail
    ? pathname.slice(`${ROUTES.PROJECT.CONTRACTS}/`.length).split('/')[0]
    : undefined;
  const contextQuery = useQuery({
    queryKey: ['project', 'context', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadProjectContext(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
  const customerDetailQuery = useQuery({
    queryKey: ['project', 'customers', 'detail', userId, customerId],
    queryFn: () => {
      if (!userId || !customerId)
        throw new Error('Thiếu thông tin khách hàng.');
      return loadCustomerDetail(userId, customerId);
    },
    enabled: Boolean(userId && customerId),
  });
  const contractDetailQuery = useQuery({
    queryKey: ['project', 'contracts', 'detail', userId, contractId],
    queryFn: () => {
      if (!userId || !contractId) throw new Error('Thiếu thông tin hợp đồng.');
      return loadContractDetail(userId, contractId);
    },
    enabled: Boolean(userId && contractId),
  });

  const tenantName = contextQuery.data?.tenantName ?? 'Đang tải tenant...';
  const accountRoles = contextQuery.data?.roleNames ?? [];
  const breadcrumbCurrent = isCustomerDetail
    ? (customerDetailQuery.data?.name ?? 'Chi tiết khách hàng')
    : isContractDetail
      ? (contractDetailQuery.data?.name ?? 'Chi tiết hợp đồng')
      : pathname === ROUTES.PROJECT.CONTRACT_CREATE
        ? 'Thêm hợp đồng'
        : pathname === ROUTES.PROJECT.EMPLOYEES
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
        ...(isCustomerDetail
          ? {
              breadcrumbItems: [
                { label: 'Trang chủ', path: '/' },
                { label: 'Khách hàng', path: ROUTES.PROJECT.CUSTOMERS },
                { label: breadcrumbCurrent },
              ],
            }
          : isContractDetail
            ? {
                breadcrumbItems: [
                  { label: 'Trang chủ', path: '/' },
                  { label: 'Hợp đồng', path: ROUTES.PROJECT.CONTRACTS },
                  { label: breadcrumbCurrent },
                ],
              }
            : pathname === ROUTES.PROJECT.CONTRACT_CREATE
              ? {
                  breadcrumbItems: [
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Hợp đồng', path: ROUTES.PROJECT.CONTRACTS },
                    { label: 'Thêm hợp đồng' },
                  ],
                }
              : {}),
      }}
    />
  );
}
