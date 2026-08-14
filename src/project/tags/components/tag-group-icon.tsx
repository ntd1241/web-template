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
  employees: Users,
  organization: Building2,
  orders: ShoppingCart,
  reports: BarChart3,
  system: Settings2,
  warehouse: Warehouse,
};

export interface TagGroupIconProps {
  moduleCode?: string | null;
  isSystem?: boolean;
  className?: string;
}

export function getTagGroupIcon(
  moduleCode?: string | null,
  isSystem = false,
): LucideIcon {
  return isSystem ? (SYSTEM_MODULE_ICONS[moduleCode ?? ''] ?? Blocks) : Folder;
}

export function TagGroupIcon({
  moduleCode,
  isSystem = false,
  className,
}: TagGroupIconProps) {
  const Icon = getTagGroupIcon(moduleCode, isSystem);

  return (
    <Icon className={cn('size-4 shrink-0', className)} aria-hidden="true" />
  );
}
