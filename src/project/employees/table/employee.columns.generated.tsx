/**
 * Scaffolded by table-builder from `src/project/employees/table/employee.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmployeeCell } from '../components/employee-cell';
import { EmployeeRolesCell } from '../components/employee-roles-cell';
import type { Employee } from '../model/employee';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  active: {
    label: 'Đang làm việc',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  inactive: {
    label: 'Ngừng làm việc',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-admin-neutral-400 opacity-100',
  },
};

const accountBadgeConfig: StatusBadgeConfig<string> = {
  true: {
    label: 'Đã liên kết',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  false: {
    label: 'Chưa liên kết',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-admin-neutral-400 opacity-100',
  },
};

export interface UseEmployeeColumnsParams {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function useEmployeeColumns(
  params: UseEmployeeColumnsParams,
): ColumnDef<Employee>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Employee>();

    return [
      col.custom({
        id: 'name',
        header: 'Nhân viên',
        headerClassName: 'min-w-[220px]',
        cell: (row) => <EmployeeCell employee={row} />,
      }),
      col.custom({
        id: 'roles',
        header: 'Vai trò',
        headerClassName: 'min-w-[200px]',
        cell: (row) => <EmployeeRolesCell employee={row} />,
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
      }),
      col.badge({
        id: 'account',
        header: 'Tài khoản',
        get: (row) => row.accountLinked,
        config: accountBadgeConfig,
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[110px]',
        cellClassName: 'text-right',
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Sửa nhân viên ${row.displayName}`}
                  onClick={() => params.onEdit(row)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  aria-label={`Xóa nhân viên ${row.displayName}`}
                  onClick={() => params.onDelete(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent variant="destructive">Xóa</TooltipContent>
            </Tooltip>
          </div>
        ),
      }),
    ];
  }, [params]);
}
