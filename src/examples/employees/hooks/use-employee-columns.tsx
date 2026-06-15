import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  EmployeeRoleBadge,
  EmployeeStatusBadge,
} from '../components/employee-badges';
import { EmployeeCell } from '../components/employee-cell';
import type { Employee } from '../model/employee';

interface UseEmployeeColumnsOptions {
  canManage: boolean;
  pendingId: string | null;
  onToggleStatus: (employee: Employee) => void;
}

/**
 * Column definitions cho DataGrid (docs/06 §6). Khai báo qua hook + useMemo để
 * không tạo lại mỗi render. Width/căn lề đặt qua `meta.headerClassName`/`cellClassName`.
 */
export function useEmployeeColumns({
  canManage,
  pendingId,
  onToggleStatus,
}: UseEmployeeColumnsOptions): ColumnDef<Employee>[] {
  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Nhân viên',
        cell: ({ row }) => <EmployeeCell employee={row.original} />,
        meta: { headerClassName: 'min-w-[260px]' },
      },
      {
        id: 'roles',
        header: 'Vai trò',
        cell: ({ row }) => (
          <div className="flex flex-wrap items-center gap-2">
            {row.original.roles.map((role) => (
              <EmployeeRoleBadge key={role} role={role} />
            ))}
          </div>
        ),
        meta: { headerClassName: 'min-w-[200px]' },
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <EmployeeStatusBadge status={row.original.status} />,
        meta: { headerClassName: 'w-[140px]' },
      },
      {
        id: 'actions',
        header: () => <span className="block text-right">Thao tác</span>,
        cell: ({ row }) => {
          const employee = row.original;
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
        meta: { headerClassName: 'w-[120px]', cellClassName: 'text-right' },
      },
    ],
    [canManage, pendingId, onToggleStatus],
  );
}
