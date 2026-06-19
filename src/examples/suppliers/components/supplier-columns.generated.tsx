/**
 * Scaffolded by table-builder from `src/examples/suppliers/table/supplier.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import type { Supplier } from '../model/supplier';

const statusBadgeConfig: StatusBadgeConfig<string> = {
  active: {
    label: 'Đang hợp tác',
    className:
      'rounded-md border-transparent bg-admin-success-bg px-2.5 py-1 text-[12px] text-admin-success-text',
    dotClassName: 'bg-admin-success-dot opacity-100',
  },
  paused: {
    label: 'Tạm dừng',
    variant: 'warning',
    className: 'rounded-md px-2.5 py-1 text-[12px]',
  },
  stopped: {
    label: 'Ngừng hợp tác',
    variant: 'outline',
    className: 'rounded-md px-2.5 py-1 text-[12px] text-muted-foreground',
    dotClassName: 'bg-admin-neutral-400 opacity-100',
  },
};

export function useSupplierColumns(): ColumnDef<Supplier>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Supplier>();

    return [
      col.text({
        id: 'code',
        header: 'Mã NCC',
        get: (row) => row.code,
        tooltipOnTruncate: true,
        headerClassName: 'w-[120px]',
        size: 120,
      }),
      col.text({
        id: 'name',
        header: 'Tên nhà cung cấp',
        get: (row) => row.name,
        tooltipOnTruncate: true,
        headerClassName: 'min-w-[260px]',
        size: 300,
      }),
      col.text({
        id: 'contact',
        header: 'Người liên hệ',
        get: (row) => row.contact,
        tooltipOnTruncate: true,
        headerClassName: 'w-[180px]',
        size: 180,
      }),
      col.text({
        id: 'phone',
        header: 'Số điện thoại',
        get: (row) => row.phone,
        headerClassName: 'w-[150px]',
        size: 150,
      }),
      col.currency({
        id: 'debt',
        header: 'Công nợ',
        get: (row) => row.debt,
        headerClassName: 'w-[150px]',
        size: 150,
      }),
      col.badge({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        config: statusBadgeConfig,
        headerClassName: 'w-[150px]',
        size: 150,
      }),
      col.date({
        id: 'startDate',
        header: 'Ngày hợp tác',
        get: (row) => row.startDate,
        headerClassName: 'w-[150px]',
        size: 150,
      }),
      col.actions({
        header: 'Thao tác',
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
        size: 120,
        cell: (row) => (
          <Button type="button" variant="outline" size="sm">
            <Eye className="size-3.5" />
            Xem
            <span className="sr-only"> nhà cung cấp {row.code}</span>
          </Button>
        ),
      }),
    ];
  }, []);
}
