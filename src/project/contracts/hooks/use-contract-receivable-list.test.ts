import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ContractReceivableTableRow } from '../model/receivable';
import {
  selectContractReceivableRows,
  useContractReceivableList,
  type ContractReceivableListFilters,
} from './use-contract-receivable-list';

function makeRow(
  overrides: Partial<ContractReceivableTableRow> = {},
): ContractReceivableTableRow {
  return {
    id: 'row-1',
    direction: 'receivable',
    periodStart: '2026-08-17',
    periodEnd: '2026-09-16',
    dueDate: '2026-09-16',
    amount: 1_000_000,
    currencyCode: 'VND',
    status: 'open',
    paidAmount: 0,
    outstandingAmount: 1_000_000,
    displayStatus: 'not_due',
    fees: [
      {
        id: 'fee-1',
        chargeId: 'charge-1',
        name: 'Phí bảo trì',
        amount: 1_000_000,
        outstandingAmount: 1_000_000,
        currencyCode: 'VND',
      },
    ],
    ...overrides,
  };
}

describe('useContractReceivableList', () => {
  it('filters by fee name without accents and sorts by the selected option', () => {
    const rows = selectContractReceivableRows(
      [
        makeRow(),
        makeRow({
          id: 'row-2',
          periodStart: '2026-07-17',
          periodEnd: '2026-08-16',
          dueDate: '2026-08-16',
          amount: 2_000_000,
          displayStatus: 'paid',
          fees: [
            {
              id: 'fee-2',
              chargeId: 'charge-2',
              name: 'Phí dịch vụ',
              amount: 2_000_000,
              outstandingAmount: 0,
              currencyCode: 'VND',
            },
          ],
        }),
      ],
      'dich vu',
      { status: 'all', sort: 'periodStart_desc' },
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe('row-2');
  });

  it('uses the shared list state and resets pagination for filter changes', () => {
    const { result } = renderHook(() =>
      useContractReceivableList({ charges: [], lines: [], dueSoonDays: 7 }),
    );

    act(() => {
      result.current.onPaginationChange({ pageIndex: 2, pageSize: 10 });
      result.current.setKeyword('bảo trì');
    });

    expect(result.current.pagination.pageIndex).toBe(0);

    act(() => {
      result.current.onPaginationChange({ pageIndex: 1, pageSize: 10 });
      result.current.setFilter<keyof ContractReceivableListFilters>(
        'status',
        'paid',
      );
    });

    expect(result.current.filters.status).toBe('paid');
    expect(result.current.pagination.pageIndex).toBe(0);
  });
});
