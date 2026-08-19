/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract-receivable.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { WalletCards } from 'lucide-react';
import { formatDate } from '@/lib/date';
import { useNumberFormat } from '@/providers/number-format-provider';
import { Button } from '@/components/ui/button';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import { Tag } from '@/components/ui/tag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ContractStatusBadge } from '../components/contract-status-badge';
import type { ContractReceivableTableRow } from '../model/receivable';

export interface UseContractReceivableTableRowColumnsParams {
  onPay: (row: ContractReceivableTableRow) => void;
}

export function useContractReceivableTableRowColumns(
  params: UseContractReceivableTableRowColumnsParams,
): ColumnDef<ContractReceivableTableRow>[] {
  const { formatCurrency } = useNumberFormat();
  const onPay = params.onPay;

  return useMemo(() => {
    const col = createColumnHelpers<ContractReceivableTableRow>();

    return [
      col.custom({
        id: 'period',
        header: 'Kỳ',
        headerClassName: 'min-w-[220px]',
        size: 260,
        enableSorting: false,
        cell: (row) => (
          <span className="whitespace-nowrap">
            {formatDate(row.periodStart)} – {formatDate(row.periodEnd)}
          </span>
        ),
      }),
      col.custom({
        id: 'fees',
        header: 'Các khoản phí',
        headerClassName: 'min-w-[240px]',
        size: 300,
        enableSorting: false,
        cell: (row) => (
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {row.fees.map((fee) => (
              <Tooltip key={fee.id}>
                <TooltipTrigger asChild>
                  <Tag
                    size="md"
                    shape="default"
                    color={
                      row.direction === 'receivable' ? '#16a34a' : '#dc2626'
                    }
                    className="whitespace-nowrap"
                  >
                    {fee.name}
                  </Tag>
                </TooltipTrigger>
                <TooltipContent variant="light">
                  <div className="space-y-0.5">
                    <p className="font-medium">{fee.name}</p>
                    <p>
                      {row.direction === 'receivable' ? 'Phải thu' : 'Phải trả'}{' '}
                      : {formatCurrency(fee.amount, fee.currencyCode)}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        ),
      }),
      col.date({
        id: 'dueDate',
        header: 'Hạn thanh toán',
        get: (row) => row.dueDate,
        headerClassName: 'min-w-[150px]',
        size: 170,
        enableSorting: false,
      }),
      col.custom({
        id: 'amount',
        header: 'Số tiền',
        headerClassName: 'min-w-[150px] text-right',
        cellClassName: 'text-right tabular-nums',
        size: 160,
        enableSorting: false,
        cell: (row) => formatCurrency(row.amount, row.currencyCode),
      }),
      col.custom({
        id: 'outstandingAmount',
        header: 'Còn lại',
        headerClassName: 'min-w-[150px] text-right',
        cellClassName: 'text-right font-semibold tabular-nums',
        size: 160,
        enableSorting: false,
        cell: (row) => (
          <span
            className={
              row.outstandingAmount > 0 ? 'text-destructive' : 'text-foreground'
            }
          >
            {formatCurrency(row.outstandingAmount, row.currencyCode)}
          </span>
        ),
      }),
      col.custom({
        id: 'displayStatus',
        header: 'Trạng thái',
        headerClassName: 'min-w-[140px]',
        size: 180,
        enableSorting: false,
        cell: (row) => (
          <ContractStatusBadge
            status={row.displayStatus}
            direction={row.direction}
            showDot
          />
        ),
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[130px]',
        cellClassName: 'text-right',
        size: 130,
        enableSorting: false,
        cell: (row) =>
          row.direction === 'receivable' && row.outstandingAmount > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => onPay(row)}
              aria-label={`Thanh toán kỳ ${formatDate(row.periodStart)}`}
            >
              <WalletCards />
              Thanh toán
            </Button>
          ) : null,
      }),
    ];
  }, [formatCurrency, onPay]);
}
