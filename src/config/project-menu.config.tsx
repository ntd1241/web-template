import { ROUTES } from '@/constants/routes';
import { LayoutDashboard, Settings, ShieldCheck, Tags } from 'lucide-react';
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
      {
        label: 'Nhãn',
        icon: Tags,
        path: ROUTES.PROJECT.TAGS,
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        label: 'Cài đặt',
        icon: Settings,
        path: ROUTES.PROJECT.SETTINGS,
      },
    ],
  },
];
