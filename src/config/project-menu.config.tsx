import { LayoutDashboard } from 'lucide-react';
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
];
