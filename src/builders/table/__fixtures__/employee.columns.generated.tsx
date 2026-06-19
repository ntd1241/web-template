/**
 * Scaffolded by table-builder from `src/builders/table/__fixtures__/employee.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { Employee } from './employee';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  active: {
    label: 'Đang hoạt động',
    className: 'bg-admin-success-bg text-admin-success-text',
    dotClassName: 'bg-admin-success-dot',
  },
  locked: { label: 'Đã khóa', variant: 'outline' },
};

export function useEmployeeColumns(): ColumnDef<Employee>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Employee>();

    return [
      col.index({
        header: 'STT',
      }),
      col.custom({
        id: 'name',
        header: 'Nhân viên',
        headerClassName: 'min-w-[240px]',
        // TODO(scaffold): điền nội dung cell — vd: (row) => <Button .../>.
        cell: () => null,
      }),
      col.text({
        id: 'email',
        header: 'Email',
        get: (row) => row.email,
        tooltipOnTruncate: true,
      }),
      col.currency({
        id: 'salary',
        header: 'Lương',
        get: (row) => row.salary,
      }),
      col.percent({
        id: 'performance',
        header: 'Hiệu suất',
        get: (row) => row.performance,
        fractionDigits: 0,
      }),
      col.date({
        id: 'startDate',
        header: 'Ngày vào',
        get: (row) => row.startDate,
        mode: 'date',
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerClassName: 'w-[140px]',
      }),
      col.actions({
        header: 'Thao tác',
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
        // TODO(scaffold): điền nội dung cell — vd: (row) => <Button .../>.
        cell: () => null,
      }),
    ];
  }, []);
}
