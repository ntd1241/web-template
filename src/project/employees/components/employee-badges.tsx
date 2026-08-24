import { Badge } from '@/components/ui/badge';
import {
  StatusBadge,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { EmployeeRole } from '../model/employee';

export const EMPLOYEE_ACCOUNT_BADGE_CONFIG: StatusBadgeConfig<string> = {
  true: {
    label: 'Đã liên kết',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  false: {
    label: 'Chưa liên kết',
    variant: 'warning',
    className:
      'rounded-md border-transparent bg-admin-amber-bg px-2.5 py-1 text-xs text-admin-amber-dark',
    dotClassName: 'bg-admin-amber-primary opacity-100',
  },
};

export function EmployeeRoleBadge({ role }: { role: EmployeeRole }) {
  return (
    <Badge
      variant={role.color}
      appearance="light"
      className="rounded-md px-2.5 py-1 text-xs"
    >
      {role.name}
    </Badge>
  );
}

export function EmployeeAccountBadge({ linked }: { linked: boolean }) {
  return (
    <StatusBadge
      status={String(linked)}
      config={EMPLOYEE_ACCOUNT_BADGE_CONFIG}
    />
  );
}
