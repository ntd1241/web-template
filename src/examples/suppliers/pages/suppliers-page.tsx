import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
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
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { usePersistedColumnVisibility } from '@/components/ui/data-grid-columns';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useSupplierColumns } from '../components/supplier-columns.generated';
import { SuppliersToolbar } from '../components/suppliers-toolbar';
import { useSupplierList } from '../hooks/use-supplier-list';

export function SuppliersPage() {
  const {
    keyword,
    onKeywordChange,
    pagination,
    onPaginationChange,
    suppliers,
    total,
    isLoading,
    isError,
    refetch,
  } = useSupplierList();
  const columns = useSupplierColumns();
  const { columnVisibility, onColumnVisibilityChange } =
    usePersistedColumnVisibility('examples.suppliers.columnVisibility');

  const table = useReactTable({
    data: suppliers,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, columnVisibility },
    onPaginationChange,
    onColumnVisibilityChange,
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(total / pagination.pageSize)),
    getCoreRowModel: getCoreRowModel(),
  });

  if (isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-admin-red-primary" />
          <div>
            <CardTitle>Không tải được danh sách</CardTitle>
            <CardDescription className="mt-1">
              Đã có lỗi khi tải dữ liệu nhà cung cấp.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
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
        isLoading={isLoading}
        emptyMessage="Không tìm thấy nhà cung cấp phù hợp"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý nhà cung cấp</CardTitle>
              <CardDescription>
                Theo dõi thông tin liên hệ, công nợ và trạng thái hợp tác
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <SuppliersToolbar
                keyword={keyword}
                isLoading={isLoading}
                onKeywordChange={onKeywordChange}
                onRefresh={() => refetch()}
              />
            </CardToolbar>
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
      </DataGrid>
    </div>
  );
}
