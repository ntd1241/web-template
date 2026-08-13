import { ROUTES } from '@/constants/routes';
import { LayoutDashboard, ShieldCheck } from 'lucide-react';
import type { MenuGroupConfig } from './menu.types';

/** Menu riêng của project thật. Các menu nghiệp vụ sẽ được bổ sung dần tại đây. */
export const PROJECT_MENU_GROUPS: MenuGroupConfig[] = [
  {
    title: 'Không gian làm việc',
    items: [
      {
        label: 'Tổng quan',
        icon: LayoutDashboard,
        path: '/',
      },
    ],
  },
  {
    title: 'Quản trị',
    items: [
      {
        label: 'Phân quyền',
        icon: ShieldCheck,
        path: ROUTES.PROJECT.ROLE_PERMISSIONS,
      },
    ],
  },
];
