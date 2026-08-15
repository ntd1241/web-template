/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
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
import { ContractCell } from '../components/contract-cell';
import type { Contract } from '../model/contract';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  draft: {
    label: 'Bản nháp',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
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
      'rounded-md border-transparent bg-admin-warning-bg px-2.5 py-1 text-xs text-admin-warning-text',
    dotClassName: 'bg-admin-warning-dot opacity-100',
  },
  expired: {
    label: 'Hết hạn',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-muted-foreground',
  },
  terminated: {
    label: 'Đã chấm dứt',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-xs text-destructive',
  },
};

export interface UseContractColumnsParams {
  onEdit: (contract: Contract) => void;
  onDelete: (contract: Contract) => void;
}

export function useContractColumns(
  params: UseContractColumnsParams,
): ColumnDef<Contract>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Contract>();

    return [
      col.custom({
        id: 'contract',
        header: 'Hợp đồng',
        headerClassName: 'min-w-[250px]',
        enableSorting: false,
        cell: (row) => <ContractCell contract={row} />,
      }),
      col.custom({
        id: 'customer',
        header: 'Khách hàng',
        headerClassName: 'min-w-[220px]',
        enableSorting: false,
        cell: (row) => (
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground">
              {row.customerName ?? 'Chưa có khách hàng'}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {row.customerCode ?? ''}
            </div>
          </div>
        ),
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        enableSorting: false,
      }),
      col.currency({
        id: 'totalOutstanding',
        header: 'Còn phải thu',
        get: (row) => row.totalOutstanding,
        headerClassName: 'min-w-[150px]',
        enableSorting: false,
      }),
      col.date({
        id: 'nextDueDate',
        header: 'Hạn gần nhất',
        get: (row) => row.nextDueDate,
        headerClassName: 'min-w-[140px]',
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Sửa hợp đồng ${row.name}`}
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
                  aria-label={`Xóa hợp đồng ${row.name}`}
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
