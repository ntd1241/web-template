import { cn } from '@/lib/utils';
import { Badge, BadgeDot } from '@/components/ui/badge';
import {
  EMPLOYEE_ROLE_LABELS,
  EMPLOYEE_STATUS_LABELS,
  type EmployeeRole,
  type EmployeeStatus,
} from '../model/employee';

const ROLE_CLASSES: Record<EmployeeRole, string> = {
  'nhan-vien': 'border-admin-blue-light bg-admin-blue-bg text-admin-blue-dark',
  'chu-so-huu': 'border-admin-red-light bg-admin-red-bg text-admin-red-dark',
  'quan-ly': 'border-[#ddd6ff] bg-admin-violet-bg text-admin-violet-dark',
};

/** Badge vai trò — màu theo token admin. (Có thể nâng thành variant trong badge.tsx nếu tái dùng rộng.) */
export function EmployeeRoleBadge({ role }: { role: EmployeeRole }) {
  return (
    <Badge
      variant="outline"
      className={cn('rounded-md px-2.5 py-1 text-[11px]', ROLE_CLASSES[role])}
    >
      {EMPLOYEE_ROLE_LABELS[role]}
    </Badge>
  );
}

/** Badge trạng thái tài khoản — active có chấm xanh. */
export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  if (status === 'active') {
    return (
      <Badge className="gap-1.5 rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-[12px] text-admin-success-text">
        <BadgeDot className="bg-admin-success-dot opacity-100" />
        {EMPLOYEE_STATUS_LABELS.active}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1.5 rounded-md px-2.5 py-1 text-[12px] text-admin-neutral-500"
    >
      <BadgeDot className="bg-admin-neutral-400 opacity-100" />
      {EMPLOYEE_STATUS_LABELS.locked}
    </Badge>
  );
}
