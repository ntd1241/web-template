import { useCallback, useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridActionBar } from '@/components/ui/data-grid-action-bar';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useOrderListQuery,
  useSetOrdersStatusMutation,
  useSetOrderStatusMutation,
} from '../api/order.queries';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUSES,
  type OrderStatus,
} from '../model/order';
import { useOrderColumns } from '../table/order.columns.generated';

export function OrdersExamplePage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>('confirmed');

  const listQuery = useOrderListQuery({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
  });
  const orders = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;

  const { mutate: setStatus } = useSetOrderStatusMutation();
  const { mutate: setStatusBulk, isPending: isBulkPending } =
    useSetOrdersStatusMutation();

  const columns = useOrderColumns({
    onStatusEdit: (row, value) =>
      setStatus({ id: row.id, status: value as OrderStatus }),
  });

  const table = useReactTable({
    data: orders,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, rowSelection },
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
    getCoreRowModel: getCoreRowModel(),
  });

  const handleBulkStatus = useCallback(() => {
    const ids = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (ids.length === 0) return;

    setStatusBulk(
      { ids, status: bulkStatus },
      { onSuccess: () => table.resetRowSelection() },
    );
  }, [bulkStatus, setStatusBulk, table]);

  if (listQuery.isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-admin-red-primary" />
          <div>
            <CardTitle>Không tải được danh sách</CardTitle>
            <CardDescription className="mt-1">
              Đã có lỗi khi tải dữ liệu đơn hàng.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => listQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={listQuery.isLoading}
        emptyMessage="Không có đơn hàng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Danh sách đơn hàng</CardTitle>
              <CardDescription>
                Ví dụ chỉnh trạng thái từng dòng và cập nhật hàng loạt
              </CardDescription>
            </CardHeading>
          </CardHeader>

          <CardTable className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>

          <CardFooter className="justify-between">
            <DataGridPagination />
          </CardFooter>
        </Card>

        <DataGridActionBar>
          <Select
            value={bulkStatus}
            onValueChange={(value) => setBulkStatus(value as OrderStatus)}
          >
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBulkStatus}
            disabled={isBulkPending}
          >
            Áp dụng
          </Button>
        </DataGridActionBar>
      </DataGrid>
    </div>
  );
}
