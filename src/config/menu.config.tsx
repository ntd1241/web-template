import { ROUTES } from '@/constants/routes';
import {
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Cấu hình menu sidebar cho MainLayout. Chỉ liệt kê trang đã có.
 *
 * - `path`: trang thật (high-fi). Nếu chưa có thì để trống.
 * - `wireframePath`: trang block-layout (greybox) nếu có. Trang chỉ có
 *   `wireframePath` (chưa làm thật) chỉ hiện khi bật "Block layout" trong sidebar.
 */
export interface MenuItemConfig {
  label: string;
  icon: LucideIcon;
  path?: string;
  wireframePath?: string;
}

export interface MenuGroupConfig {
  title: string;
  items: MenuItemConfig[];
}

/**
 * Đích điều hướng của một item theo chế độ wireframe.
 * - wireframe ON: ưu tiên `wireframePath` (trang block-layout).
 * - ngược lại: dùng `path` (trang thật).
 * Trả về `null` khi item không có đích phù hợp -> ẩn item.
 */
export function resolveMenuTarget(
  item: MenuItemConfig,
  wireframeMode: boolean,
): { to: string; isWireframe: boolean } | null {
  if (wireframeMode && item.wireframePath) {
    return { to: item.wireframePath, isWireframe: true };
  }
  if (item.path) return { to: item.path, isWireframe: false };
  return null;
}

export const MENU_GROUPS: MenuGroupConfig[] = [
  {
    title: 'Quản trị',
    items: [
      { label: 'Nhân viên', icon: Users, path: ROUTES.EXAMPLE.EMPLOYEES },
      { label: 'Đơn hàng', icon: ShoppingCart, path: ROUTES.EXAMPLE.ORDERS },
      {
        label: 'Vật tư',
        icon: PackageCheck,
        path: ROUTES.EXAMPLE.MATERIALS,
      },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      {
        label: 'Phân quyền',
        icon: ShieldCheck,
        path: ROUTES.EXAMPLE.ROLE_PERMISSIONS,
        wireframePath: '/example/role-permissions/wireframe',
      },
    ],
  },
];
