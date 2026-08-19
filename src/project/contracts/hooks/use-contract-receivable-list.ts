import { useMemo } from 'react';
import { useTableListState } from '@/hooks/use-table-list-state';
import type { ContractVersionLine } from '../model/contract';
import {
  CONTRACT_CHARGE_DISPLAY_STATUS_LABELS,
  mapContractReceivableTableRows,
  type ContractChargeBalance,
  type ContractChargeDisplayStatus,
  type ContractReceivableTableRow,
} from '../model/receivable';

export type ContractReceivableSortOption =
  | 'periodStart_desc'
  | 'periodStart_asc'
  | 'dueDate_desc'
  | 'dueDate_asc'
  | 'amount_desc'
  | 'amount_asc';

export interface ContractReceivableListFilters {
  status: 'all' | ContractChargeDisplayStatus;
  sort: ContractReceivableSortOption;
}

const INITIAL_FILTERS: ContractReceivableListFilters = {
  status: 'all',
  sort: 'periodStart_desc',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(`${value}T00:00:00`));
}

function normalizeSearchValue(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi-VN');
}

function compareRows(
  first: ContractReceivableTableRow,
  second: ContractReceivableTableRow,
  sort: ContractReceivableSortOption,
) {
  const compareDates = (firstValue: string, secondValue: string) =>
    firstValue.localeCompare(secondValue);

  switch (sort) {
    case 'periodStart_asc':
      return (
        compareDates(first.periodStart, second.periodStart) ||
        compareDates(first.periodEnd, second.periodEnd)
      );
    case 'dueDate_desc':
      return (
        compareDates(second.dueDate, first.dueDate) ||
        compareDates(second.periodStart, first.periodStart)
      );
    case 'dueDate_asc':
      return (
        compareDates(first.dueDate, second.dueDate) ||
        compareDates(first.periodStart, second.periodStart)
      );
    case 'amount_desc':
      return (
        second.amount - first.amount ||
        compareDates(second.periodStart, first.periodStart)
      );
    case 'amount_asc':
      return (
        first.amount - second.amount ||
        compareDates(second.periodStart, first.periodStart)
      );
    case 'periodStart_desc':
    default:
      return (
        compareDates(second.periodStart, first.periodStart) ||
        compareDates(second.periodEnd, first.periodEnd)
      );
  }
}

function selectRows(
  rows: ContractReceivableTableRow[],
  keyword: string,
  filters: ContractReceivableListFilters,
) {
  const normalizedKeyword = normalizeSearchValue(keyword.trim());

  return rows
    .filter((row) => {
      if (filters.status !== 'all' && row.displayStatus !== filters.status) {
        return false;
      }

      if (!normalizedKeyword) return true;

      const searchValues = [
        row.periodStart,
        row.periodEnd,
        row.dueDate,
        formatDate(row.periodStart),
        formatDate(row.periodEnd),
        formatDate(row.dueDate),
        CONTRACT_CHARGE_DISPLAY_STATUS_LABELS[row.displayStatus],
        ...row.fees.map((fee) => fee.name),
      ];

      return searchValues.some((value) =>
        normalizeSearchValue(value).includes(normalizedKeyword),
      );
    })
    .sort((first, second) => compareRows(first, second, filters.sort));
}

export function useContractReceivableList({
  charges,
  lines,
  dueSoonDays,
}: {
  charges: ContractChargeBalance[];
  lines: ContractVersionLine[];
  dueSoonDays: number;
}) {
  const listState = useTableListState<ContractReceivableListFilters>({
    initialFilters: INITIAL_FILTERS,
    initialPageSize: 10,
  });
  const rows = useMemo(
    () => mapContractReceivableTableRows(charges, lines, dueSoonDays),
    [charges, lines, dueSoonDays],
  );
  const visibleRows = useMemo(
    () => selectRows(rows, listState.keyword, listState.filters),
    [listState.filters, listState.keyword, rows],
  );

  return {
    ...listState,
    rows,
    visibleRows,
  };
}

export { selectRows as selectContractReceivableRows };
