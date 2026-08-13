import { ROUTES } from '@/constants/routes';
import {
  Boxes,
  ChartLine,
  ClipboardCheck,
  Columns2,
  FilePen,
  PackageCheck,
  Settings,
  ShoppingCart,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import type { MenuGroupConfig } from './menu.types';

export type { MenuGroupConfig, MenuItemConfig } from './menu.types';
export { getMenuItemKey, resolveMenuTarget } from './menu.types';

export const MENU_GROUPS: MenuGroupConfig[] = [
  {
    title: 'Quản trị',
    items: [
      { label: 'Nhân viên', icon: Users, path: ROUTES.EXAMPLE.EMPLOYEES },
      {
        label: 'Đơn hàng',
        icon: ShoppingCart,
        path: ROUTES.EXAMPLE.ORDERS,
        badge: 3,
      },
      {
        label: 'Sửa đơn hàng',
        icon: FilePen,
        path: ROUTES.EXAMPLE.ORDER_EDIT,
      },
      {
        label: 'Vật tư',
        icon: PackageCheck,
        path: ROUTES.EXAMPLE.MATERIALS,
      },
      {
        label: 'Danh mục thông số',
        icon: SlidersHorizontal,
        path: ROUTES.EXAMPLE.MATERIAL_SPECS,
      },
      {
        label: 'Mẫu vật tư',
        icon: Boxes,
        path: ROUTES.EXAMPLE.MATERIAL_MODELS,
        wireframePath: '/example/material/models/wireframe',
      },
      {
        label: 'Bảng kiểm định',
        icon: ClipboardCheck,
        path: ROUTES.EXAMPLE.MATERIAL_INSPECTIONS,
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        label: 'Cài đặt',
        icon: Settings,
        path: ROUTES.EXAMPLE.SETTINGS,
      },
      {
        label: 'Showcase biểu đồ',
        icon: ChartLine,
        path: ROUTES.EXAMPLE.CHARTS,
      },
    ],
  },
  {
    title: 'Content layouts',
    items: [
      {
        label: 'Chia 2 phần',
        icon: Columns2,
        path: ROUTES.EXAMPLE.CONTENT_LAYOUT_TWO_COLUMN,
      },
    ],
  },
];
