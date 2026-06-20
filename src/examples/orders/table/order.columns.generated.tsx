/**
 * Scaffolded by table-builder from `src/examples/orders/table/order.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import type { Order } from '../model/order';

const statusOptions = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export interface UseOrderColumnsParams {
  onStatusEdit: (row: Order, value: string) => void;
}

export function useOrderColumns(
  params: UseOrderColumnsParams,
): ColumnDef<Order>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Order>();

    return [
      col.select(),
      col.text({
        id: 'code',
        header: 'Mã đơn',
        get: (row) => row.code,
      }),
      col.text({
        id: 'customerName',
        header: 'Khách hàng',
        get: (row) => row.customerName,
        tooltipOnTruncate: true,
      }),
      col.currency({
        id: 'total',
        header: 'Tổng tiền',
        get: (row) => row.total,
      }),
      col.date({
        id: 'createdAt',
        header: 'Ngày tạo',
        get: (row) => row.createdAt,
        mode: 'date',
      }),
      col.editableSelect({
        id: 'status',
        header: 'Trạng thái',
        get: (row) => row.status,
        options: statusOptions,
        onEdit: params.onStatusEdit,
        placeholder: 'Chọn trạng thái',
      }),
    ];
  }, [params.onStatusEdit]);
}
