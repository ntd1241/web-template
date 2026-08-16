/**
 * Scaffolded by table-builder from `src/project/contracts/table/contract-receivable.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/date';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import { Tag } from '@/components/ui/tag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatContractAmount } from '../api/contracts.api';
import { ContractStatusBadge } from '../components/contract-status-badge';
import type { ContractReceivableTableRow } from '../model/receivable';

export function useContractReceivableTableRowColumns(): ColumnDef<ContractReceivableTableRow>[] {
  return useMemo(() => {
    const col = createColumnHelpers<ContractReceivableTableRow>();

    return [
      col.custom({
        id: 'period',
        header: 'Kỳ',
        headerClassName: 'min-w-[220px]',
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
        enableSorting: false,
        cell: (row) => (
          <div className="flex flex-wrap gap-1.5">
            {row.fees.map((fee) => (
              <Tooltip key={fee.id}>
                <TooltipTrigger asChild>
                  <Tag
                    size="md"
                    shape="default"
                    color={
                      row.direction === 'receivable' ? '#16a34a' : '#dc2626'
                    }
                  >
                    {fee.name}
                  </Tag>
                </TooltipTrigger>
                <TooltipContent variant="light">
                  <div className="space-y-0.5">
                    <p className="font-medium">{fee.name}</p>
                    <p>
                      {row.direction === 'receivable' ? 'Phải thu' : 'Phải trả'}{' '}
                      : {formatContractAmount(fee.amount, fee.currencyCode)}
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
        enableSorting: false,
      }),
      col.custom({
        id: 'amount',
        header: 'Số tiền',
        headerClassName: 'min-w-[150px] text-right',
        cellClassName: 'text-right tabular-nums',
        enableSorting: false,
        cell: (row) => formatContractAmount(row.amount, row.currencyCode),
      }),
      col.custom({
        id: 'outstandingAmount',
        header: 'Còn lại',
        headerClassName: 'min-w-[150px] text-right',
        cellClassName: 'text-right font-semibold tabular-nums',
        enableSorting: false,
        cell: (row) =>
          formatContractAmount(row.outstandingAmount, row.currencyCode),
      }),
      col.custom({
        id: 'displayStatus',
        header: 'Trạng thái',
        headerClassName: 'min-w-[140px]',
        enableSorting: false,
        cell: (row) => (
          <ContractStatusBadge
            status={row.displayStatus}
            direction={row.direction}
            showDot
          />
        ),
      }),
    ];
  }, []);
}
