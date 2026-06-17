import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import { EmployeeRoleBadge } from '../components/employee-badges';
import { EmployeeCell } from '../components/employee-cell';
import {
  EMPLOYEE_STATUS_LABELS,
  type Employee,
  type EmployeeStatus,
} from '../model/employee';

interface UseEmployeeColumnsOptions {
  canManage: boolean;
  pendingId: string | null;
  onToggleStatus: (employee: Employee) => void;
}

const employeeStatusBadgeConfig: StatusBadgeConfig<EmployeeStatus> = {
  active: {
    label: EMPLOYEE_STATUS_LABELS.active,
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-[12px] text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  locked: {
    label: EMPLOYEE_STATUS_LABELS.locked,
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-[12px] text-admin-neutral-500',
    dotClassName: 'bg-admin-neutral-400 opacity-100',
  },
};

/**
 * Column definitions cho DataGrid (docs/06 §6). Khai báo qua hook + useMemo để
 * không tạo lại mỗi render. Width/căn lề đặt qua `meta.headerClassName`/`cellClassName`.
 */
export function useEmployeeColumns({
  canManage,
  pendingId,
  onToggleStatus,
}: UseEmployeeColumnsOptions): ColumnDef<Employee>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Employee>();

    return [
      col.custom({
        id: 'name',
        header: 'Nhân viên',
        cell: (employee) => <EmployeeCell employee={employee} />,
        headerClassName: 'min-w-[260px]',
      }),
      col.custom({
        id: 'roles',
        header: 'Vai trò',
        cell: (employee) => (
          <div className="flex flex-wrap items-center gap-2">
            {employee.roles.map((role) => (
              <EmployeeRoleBadge key={role} role={role} />
            ))}
          </div>
        ),
        headerClassName: 'min-w-[200px]',
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (employee) => employee.status,
        config: employeeStatusBadgeConfig,
        headerClassName: 'w-[140px]',
      }),
      col.actions({
        header: 'Thao tác',
        cell: (employee) => {
          const isOwner = employee.roles.includes('chu-so-huu');

          // Action nhận biết quyền: chủ sở hữu hoặc thiếu quyền → không cho thao tác.
          if (!canManage || isOwner) {
            return (
              <div className="text-right text-[12px] text-admin-neutral-400">
                —
              </div>
            );
          }

          const locked = employee.status === 'locked';
          return (
            <div className="text-right">
              <Button
                variant="outline"
                size="sm"
                disabled={pendingId === employee.id}
                onClick={() => onToggleStatus(employee)}
              >
                {locked ? <LockOpen /> : <Lock />}
                {locked ? 'Mở khóa' : 'Khóa'}
              </Button>
            </div>
          );
        },
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
      }),
    ];
  }, [canManage, pendingId, onToggleStatus]);
}
