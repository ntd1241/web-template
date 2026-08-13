/**
 * Scaffolded by table-builder from `src/project/employees/table/employee.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, UserRound } from 'lucide-react';
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
import type { Employee } from '../model/employee';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  active: { label: 'Đang làm việc', variant: 'success' },
  inactive: { label: 'Ngừng làm việc', variant: 'secondary' },
};

const accountBadgeConfig: StatusBadgeConfig<string> = {
  true: { label: 'Đã liên kết', variant: 'success' },
  false: { label: 'Chưa liên kết', variant: 'outline' },
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
      col.index({
        header: 'STT',
      }),
      col.text({
        id: 'employeeCode',
        header: 'Mã nhân viên',
        get: (row) => row.employeeCode,
      }),
      col.custom({
        id: 'name',
        header: 'Nhân viên',
        headerClassName: 'min-w-[220px]',
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {row.displayName.slice(0, 1).toUpperCase() || (
                <UserRound className="size-4" />
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate font-medium text-foreground">
                {row.displayName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.phone || 'Chưa có số điện thoại'}
              </div>
            </div>
          </div>
        ),
      }),
      col.text({
        id: 'department',
        header: 'Phòng ban',
        get: (row) => row.department,
      }),
      col.text({
        id: 'jobTitle',
        header: 'Chức vụ',
        get: (row) => row.jobTitle,
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
