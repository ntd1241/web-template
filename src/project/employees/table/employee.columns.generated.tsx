/**
 * Scaffolded by table-builder from `src/project/employees/table/employee.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import {
  createColumnHelpers,
  DataGridActionButton,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import { EmployeeCell } from '../components/employee-cell';
import { EMPLOYEE_ACCOUNT_BADGE_CONFIG } from '../components/employee-badges';
import { EmployeeRolesCell } from '../components/employee-roles-cell';
import {
  EMPLOYEE_ACCOUNT_FILTER_OPTIONS,
  EMPLOYEE_STATUS_FILTER_OPTIONS,
  toEmployeeRoleFilterOption,
} from './employee-column-filters';
import {
  EmployeeAccountColumnFilter,
  EmployeeRolesColumnFilter,
  EmployeeStatusColumnFilter,
  EmployeeTextColumnFilter,
} from './employee-column-filters.generated';
import type {
  Employee,
  EmployeeRoleOption,
  EmployeeStatus,
} from '../model/employee';

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

export interface UseEmployeeColumnsParams {
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  employeeSearch: string;
  onEmployeeSearchChange: (value: string) => void;
  roleIds: string[];
  roleOptions: EmployeeRoleOption[];
  roleOptionsLoading?: boolean;
  onRoleIdsChange: (value: string[]) => void;
  statuses: EmployeeStatus[];
  onStatusesChange: (value: EmployeeStatus[]) => void;
  accountLinked: string;
  onAccountLinkedChange: (value: string) => void;
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
        headerFilter: (
          <EmployeeTextColumnFilter
            value={params.employeeSearch}
            onChange={params.onEmployeeSearchChange}
          />
        ),
        headerClassName: 'min-w-[220px]',
        size: 280,
        enableSorting: false,
        cell: (row) => <EmployeeCell employee={row} />,
      }),
      col.custom({
        id: 'roles',
        header: 'Vai trò',
        headerFilter: (
          <EmployeeRolesColumnFilter
            value={params.roleIds}
            options={params.roleOptions.map(toEmployeeRoleFilterOption)}
            disabled={params.roleOptionsLoading}
            onChange={params.onRoleIdsChange}
          />
        ),
        headerClassName: 'min-w-[200px]',
        size: 240,
        enableSorting: false,
        cell: (row) => <EmployeeRolesCell employee={row} />,
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerFilter: (
          <EmployeeStatusColumnFilter
            value={params.statuses}
            options={EMPLOYEE_STATUS_FILTER_OPTIONS}
            onChange={(value) =>
              params.onStatusesChange(value as EmployeeStatus[])
            }
          />
        ),
        headerClassName: 'min-w-[170px]',
        size: 170,
        enableSorting: false,
      }),
      col.badge({
        id: 'account',
        header: 'Tài khoản',
        get: (row) => row.accountLinked,
        config: EMPLOYEE_ACCOUNT_BADGE_CONFIG,
        headerFilter: (
          <EmployeeAccountColumnFilter
            value={params.accountLinked}
            options={EMPLOYEE_ACCOUNT_FILTER_OPTIONS}
            onChange={params.onAccountLinkedChange}
            renderOption={(option) => option.label}
          />
        ),
        headerClassName: 'min-w-[170px]',
        size: 170,
        enableSorting: false,
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[110px]',
        cellClassName: 'text-right',
        enableSorting: false,
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <DataGridActionButton
              action="edit"
              tooltip="Sửa"
              type="button"
              mode="icon"
              size="sm"
              aria-label={`Sửa nhân viên ${row.displayName}`}
              onClick={() => params.onEdit(row)}
            >
              <Pencil className="size-4" />
            </DataGridActionButton>
            <DataGridActionButton
              action="delete"
              tooltip="Xóa"
              type="button"
              mode="icon"
              size="sm"
              aria-label={`Xóa nhân viên ${row.displayName}`}
              onClick={() => params.onDelete(row)}
            >
              <Trash2 className="size-4" />
            </DataGridActionButton>
          </div>
        ),
      }),
    ];
  }, [params]);
}
