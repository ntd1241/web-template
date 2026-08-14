import {
  BarChart3,
  Blocks,
  Building2,
  Folder,
  Settings2,
  ShoppingCart,
  Users,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SYSTEM_MODULE_ICONS: Record<string, LucideIcon> = {
  customers: UsersRound,
  organization: Building2,
  orders: ShoppingCart,
  reports: BarChart3,
  system: Settings2,
  warehouse: Warehouse,
};

const SYSTEM_GROUP_ICONS: Record<string, LucideIcon> = {
  employees: Users,
};

export interface TagGroupIconProps {
  groupCode?: string | null;
  moduleCode?: string | null;
  isSystem?: boolean;
  className?: string;
}

export function getTagGroupIcon(
  moduleCode?: string | null,
  isSystem = false,
  groupCode?: string | null,
): LucideIcon {
  if (!isSystem) return Folder;

  return (
    SYSTEM_GROUP_ICONS[groupCode ?? ''] ??
    SYSTEM_MODULE_ICONS[moduleCode ?? ''] ??
    Blocks
  );
}

export function TagGroupIcon({
  groupCode,
  moduleCode,
  isSystem = false,
  className,
}: TagGroupIconProps) {
  const Icon = getTagGroupIcon(moduleCode, isSystem, groupCode);

  return (
    <Icon className={cn('size-4 shrink-0', className)} aria-hidden="true" />
  );
}
