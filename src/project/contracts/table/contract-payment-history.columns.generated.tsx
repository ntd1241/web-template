/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract-payment-history.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/date';
import { useNumberFormat } from '@/providers/number-format-provider';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import {
  PAYMENT_METHOD_LABELS,
  type ContractPaymentHistory,
} from '../model/receivable';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  posted: {
    label: 'Đã ghi nhận',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-xs text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  reversed: {
    label: 'Đã đảo ngược',
    variant: 'destructive',
    className: 'rounded-md px-2.5 py-1 text-xs',
  },
};

export function useContractPaymentHistoryColumns(): ColumnDef<ContractPaymentHistory>[] {
  const { formatCurrency } = useNumberFormat();

  return useMemo(() => {
    const col = createColumnHelpers<ContractPaymentHistory>();

    return [
      col.date({
        id: 'receivedAt',
        header: 'Ngày nhận',
        get: (row) => row.receivedAt,
        headerClassName: 'min-w-[130px]',
        size: 150,
        enableSorting: false,
      }),
      col.custom({
        id: 'allocations',
        header: 'Khoản phí / kỳ',
        headerClassName: 'min-w-[360px]',
        size: 420,
        enableSorting: false,
        cell: (row) => (
          <div className="min-w-[360px] space-y-2">
            {row.allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {allocation.feeName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(allocation.periodStart)} –{' '}
                    {formatDate(allocation.periodEnd)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                  {formatCurrency(
                    allocation.allocatedAmount,
                    allocation.currencyCode,
                  )}
                </span>
              </div>
            ))}
          </div>
        ),
      }),
      col.custom({
        id: 'paymentMethod',
        header: 'Phương thức',
        headerClassName: 'min-w-[130px]',
        size: 150,
        enableSorting: false,
        cell: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod],
      }),
      col.custom({
        id: 'reference',
        header: 'Mã tham chiếu',
        headerClassName: 'min-w-[150px]',
        size: 180,
        enableSorting: false,
        cell: (row) => row.reference || '—',
      }),
      col.custom({
        id: 'amount',
        header: 'Tổng thanh toán',
        headerClassName: 'min-w-[160px] text-right',
        cellClassName: 'text-right font-semibold tabular-nums',
        size: 180,
        enableSorting: false,
        cell: (row) => formatCurrency(row.amount, row.currencyCode),
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerClassName: 'min-w-[130px]',
        size: 150,
        enableSorting: false,
      }),
    ];
  }, [formatCurrency]);
}
