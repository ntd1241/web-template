/**
 * Scaffolded by table-builder from `src/project/customers/table/customer.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
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
import { CustomerCell } from '../components/customer-cell';
import { BUSINESS_TYPE_LABELS, type Customer } from '../model/customer';
import {
  CUSTOMER_BUSINESS_TYPE_FILTER_OPTIONS,
  CUSTOMER_STATUS_FILTER_OPTIONS,
} from './customer-column-filters';
import {
  CustomerBusinessTypeColumnFilter,
  CustomerContactColumnFilter,
  CustomerStatusColumnFilter,
  CustomerTextColumnFilter,
} from './customer-column-filters.generated';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  active: {
    label: 'Đang hoạt động',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  inactive: {
    label: 'Ngừng hoạt động',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-admin-neutral-400 opacity-100',
  },
};

export interface UseCustomerColumnsParams {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  customerSearch: string;
  onCustomerSearchChange: (value: string) => void;
  businessTypes: string[];
  onBusinessTypesChange: (value: string[]) => void;
  contactSearch: string;
  onContactSearchChange: (value: string) => void;
  statuses: string[];
  onStatusesChange: (value: string[]) => void;
}

export function useCustomerColumns(
  params: UseCustomerColumnsParams,
): ColumnDef<Customer>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Customer>();

    return [
      col.custom({
        id: 'name',
        header: 'Khách hàng',
        headerFilter: (
          <CustomerTextColumnFilter
            value={params.customerSearch}
            onChange={params.onCustomerSearchChange}
          />
        ),
        headerClassName: 'min-w-[240px]',
        enableSorting: false,
        cell: (row) => <CustomerCell customer={row} />,
      }),
      col.custom({
        id: 'businessType',
        header: 'Loại hình đơn vị',
        headerFilter: (
          <CustomerBusinessTypeColumnFilter
            value={params.businessTypes}
            options={CUSTOMER_BUSINESS_TYPE_FILTER_OPTIONS}
            onChange={params.onBusinessTypesChange}
          />
        ),
        headerClassName: 'min-w-[160px]',
        enableSorting: false,
        cell: (row) => (
          <span className="text-sm text-foreground">
            {BUSINESS_TYPE_LABELS[row.businessType]}
          </span>
        ),
      }),
      col.custom({
        id: 'contact',
        header: 'Liên hệ',
        headerFilter: (
          <CustomerContactColumnFilter
            value={params.contactSearch}
            onChange={params.onContactSearchChange}
          />
        ),
        headerClassName: 'min-w-[220px]',
        enableSorting: false,
        cell: (row) => (
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground">
              {row.phone || 'Chưa có số điện thoại'}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {row.email || 'Chưa có email'}
            </div>
          </div>
        ),
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerFilter: (
          <CustomerStatusColumnFilter
            value={params.statuses}
            options={CUSTOMER_STATUS_FILTER_OPTIONS}
            onChange={params.onStatusesChange}
          />
        ),
        headerClassName: 'min-w-[170px]',
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
              aria-label={`Sửa khách hàng ${row.name}`}
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
              aria-label={`Xóa khách hàng ${row.name}`}
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
