import type { LucideIcon } from 'lucide-react';

export interface MenuItemConfig {
  label: string;
  icon: LucideIcon;
  path?: string;
  wireframePath?: string;
  badge?: number;
}

export interface MenuGroupConfig {
  title: string;
  items: MenuItemConfig[];
}

/** Khóa ổn định dùng cho các preference gắn với menu, ví dụ menu đã ghim. */
export function getMenuItemKey(item: MenuItemConfig): string {
  return item.path ?? item.wireframePath ?? item.label;
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
