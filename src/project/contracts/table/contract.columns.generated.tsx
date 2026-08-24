/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNumberFormat } from '@/providers/number-format-provider';
import {
  createColumnHelpers,
  DataGridActionButton,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { CustomerSelectOption } from '../../customers/api/customers.api';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { ContractCell } from '../components/contract-cell';
import type { Contract } from '../model/contract';
import {
  CONTRACT_STATUS_FILTER_OPTIONS,
  renderContractCustomerFilterTrigger,
  toContractCustomerFilterOption,
} from './contract-column-filters';
import {
  ContractCustomerColumnFilter,
  ContractNextDueColumnFilter,
  ContractOutstandingColumnFilter,
  ContractStatusColumnFilter,
  ContractTextColumnFilter,
} from './contract-column-filters.generated';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  draft: {
    label: 'Bản nháp',
    className:
      'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-muted-foreground opacity-100',
  },
  active: {
    label: 'Đang hiệu lực',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  suspended: {
    label: 'Tạm dừng',
    className:
      'rounded-md border-transparent bg-admin-amber-bg px-2.5 py-1 text-xs text-admin-amber-dark',
    dotClassName: 'bg-admin-amber-primary opacity-100',
  },
  expired: {
    label: 'Hết hạn',
    className:
      'rounded-md border-transparent bg-muted px-2.5 py-1 text-xs text-muted-foreground',
    dotClassName: 'bg-muted-foreground opacity-100',
  },
  terminated: {
    label: 'Đã chấm dứt',
    className:
      'rounded-md border-transparent bg-admin-red-bg px-2.5 py-1 text-xs text-admin-red-dark',
    dotClassName: 'bg-admin-red-primary opacity-100',
  },
};

export interface UseContractColumnsParams {
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
  contractSearch: string;
  onContractSearchChange: (value: string) => void;
  customerId: string;
  customerOptions: CustomerSelectOption[];
  customerOptionsLoading?: boolean;
  onCustomerIdChange: (value: string) => void;
  statuses: import('../model/contract').ContractStatus[];
  onStatusChange: (
    value: import('../model/contract').ContractStatus[],
  ) => void;
  outstandingMin?: number;
  outstandingMax?: number;
  onOutstandingChange: (value: { min?: number; max?: number }) => void;
  nextDueFrom: string;
  nextDueTo: string;
  onNextDueChange: (value: { from?: string; to?: string }) => void;
}

export function useContractColumns(
  params: UseContractColumnsParams,
): ColumnDef<Contract>[] {
  const { formatNumber, formatCurrency, formatPercent } = useNumberFormat();

  return useMemo(() => {
    const col = createColumnHelpers<Contract>({
      formatNumber,
      formatCurrency,
      formatPercent,
    });

    return [
      col.custom({
        id: 'contract',
        header: 'Hợp đồng',
        headerFilter: (
          <ContractTextColumnFilter
            value={params.contractSearch}
            onChange={params.onContractSearchChange}
          />
        ),
        headerClassName: 'min-w-[320px]',
        size: 340,
        enableSorting: false,
        cell: (row) => <ContractCell contract={row} />,
      }),
      col.custom({
        id: 'customer',
        header: 'Khách hàng',
        headerFilter: (
          <ContractCustomerColumnFilter
            value={params.customerId}
            options={params.customerOptions.map(toContractCustomerFilterOption)}
            loading={params.customerOptionsLoading}
            disabled={
              Boolean(params.customerOptionsLoading) &&
              params.customerOptions.length === 0
            }
            triggerContent={renderContractCustomerFilterTrigger}
            renderOption={(option) => option.label}
            onChange={params.onCustomerIdChange}
          />
        ),
        headerClassName: 'min-w-[240px]',
        size: 280,
        enableSorting: false,
        cell: (row) => (
          <Link
            to={buildPath(ROUTES.PROJECT.CUSTOMER_DETAIL, {
              id: row.customerId,
            })}
            target="_blank"
            rel="noreferrer"
            className="block min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Xem chi tiết khách hàng ${row.customerName ?? ''}`}
          >
            <CustomerIdentity
              customer={{
                name: row.customerName ?? 'Chưa có khách hàng',
                customerCode: row.customerCode ?? '',
                imageUrl: row.customerImageUrl,
              }}
            />
          </Link>
        ),
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerFilter: (
          <ContractStatusColumnFilter
            value={params.statuses}
            options={CONTRACT_STATUS_FILTER_OPTIONS}
            onChange={(value) =>
              params.onStatusChange(value as typeof params.statuses)
            }
          />
        ),
        headerClassName: 'w-[140px]',
        size: 140,
        enableSorting: false,
      }),
      col.currency({
        id: 'totalOutstanding',
        header: 'Còn phải thu',
        get: (row) => row.totalOutstanding,
        headerFilter: (
          <ContractOutstandingColumnFilter
            value={{ min: params.outstandingMin, max: params.outstandingMax }}
            onChange={params.onOutstandingChange}
          />
        ),
        headerClassName: 'w-[150px]',
        cellClassName: 'px-3',
        size: 150,
        enableSorting: false,
      }),
      col.date({
        id: 'nextDueDate',
        header: 'Hạn gần nhất',
        get: (row) => row.nextDueDate,
        headerFilter: (
          <ContractNextDueColumnFilter
            value={{ from: params.nextDueFrom, to: params.nextDueTo }}
            onChange={params.onNextDueChange}
          />
        ),
        headerClassName: 'w-[160px]',
        size: 160,
        enableSorting: false,
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[100px]',
        size: 100,
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
              aria-label={`Sửa hợp đồng ${row.name}`}
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
              aria-label={`Xóa hợp đồng ${row.name}`}
              onClick={() => params.onDelete(row)}
            >
              <Trash2 className="size-4" />
            </DataGridActionButton>
          </div>
        ),
      }),
    ];
  }, [formatCurrency, formatNumber, formatPercent, params]);
}
