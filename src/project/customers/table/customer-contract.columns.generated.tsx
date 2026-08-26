/**
 * Scaffolded by table-builder from `src/project/customers/table/customer-contract.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, Eye, WalletCards } from 'lucide-react';
import { formatDate } from '@/lib/date';
import { useNumberFormat } from '@/providers/number-format-provider';
import {
  createColumnHelpers,
  DataGridActionButton,
} from '@/components/ui/data-grid-columns';
import { ContractCell } from '../../contracts/components/contract-cell';
import { ContractStatusBadge } from '../../contracts/components/contract-status-badge';
import type { Contract } from '../../contracts/model/contract';

export interface UseContractColumnsParams {
  onPrimary: (row: Contract) => void;
  onView: (row: Contract) => void;
  onOther: (row: Contract) => void;
}

export function useContractColumns(
  params: UseContractColumnsParams,
): ColumnDef<Contract>[] {
  const { formatNumber, formatCurrency, formatPercent } = useNumberFormat();
  const { onPrimary, onView, onOther } = params;

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
        headerClassName: 'min-w-[300px]',
        size: 360,
        enableSorting: false,
        cell: (row) => <ContractCell contract={row} />,
      }),
      col.custom({
        id: 'status',
        header: 'Trạng thái',
        headerClassName: 'w-[150px]',
        size: 150,
        enableSorting: false,
        cell: (row) => <ContractStatusBadge status={row.status} showDot />,
      }),
      col.date({
        id: 'startDate',
        header: 'Ngày bắt đầu',
        get: (row) => row.startDate,
        headerClassName: 'w-[150px]',
        size: 150,
        enableSorting: false,
      }),
      col.custom({
        id: 'endDate',
        header: 'Ngày kết thúc',
        headerClassName: 'w-[150px]',
        size: 150,
        enableSorting: false,
        cell: (row) =>
          row.endDate ? formatDate(row.endDate) : 'Không giới hạn',
      }),
      col.currency({
        id: 'totalOutstanding',
        header: 'Còn phải thu',
        get: (row) => row.totalOutstanding,
        headerClassName: 'w-[160px]',
        cellClassName: 'px-3',
        size: 160,
        enableSorting: false,
      }),
      col.custom({
        id: 'nextDueDate',
        header: 'Hạn gần nhất',
        headerClassName: 'w-[160px]',
        size: 160,
        enableSorting: false,
        cell: (row) =>
          row.nextDueDate ? formatDate(row.nextDueDate) : 'Chưa phát sinh',
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[280px]',
        cellClassName: 'text-right',
        size: 280,
        enableSorting: false,
        cell: (row) => (
          <div className="flex justify-end gap-1">
            <DataGridActionButton
              action="primary"
              tooltip="Thanh toán"
              aria-label={`Thanh toán hợp đồng ${row.name}`}
              type="button"
              size="sm"
              onClick={() => onPrimary(row)}
            >
              <WalletCards className="size-4" />
              Thanh toán
            </DataGridActionButton>
            <DataGridActionButton
              action="view"
              tooltip="Xem"
              aria-label="Xem"
              type="button"
              mode="icon"
              size="sm"
              onClick={() => onView(row)}
            >
              <Eye className="size-4" />
            </DataGridActionButton>
            <DataGridActionButton
              action="other"
              tooltip="Mở trang hợp đồng"
              aria-label={`Mở trang hợp đồng ${row.name}`}
              type="button"
              mode="icon"
              size="sm"
              onClick={() => onOther(row)}
            >
              <ExternalLink className="size-4" />
            </DataGridActionButton>
          </div>
        ),
      }),
    ];
  }, [formatNumber, formatCurrency, formatPercent, onPrimary, onView, onOther]);
}
