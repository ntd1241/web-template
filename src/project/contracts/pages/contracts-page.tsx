import { useMemo, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
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
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { SearchInput } from '@/components/ui/inputs/search-input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { deleteContract, loadContractWorkspace } from '../api/contracts.api';
import type { Contract } from '../model/contract';
import { useContractColumns } from '../table/contract.columns.generated';

const EMPTY_CONTRACTS: Contract[] = [];

export function ContractsPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingContract, setDeletingContract] = useState<Contract | null>(
    null,
  );

  const workspaceQuery = useQuery({
    queryKey: ['project', 'contracts', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadContractWorkspace(userId);
    },
    enabled: Boolean(userId),
  });

  const contracts = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    const source = workspaceQuery.data?.contracts ?? EMPTY_CONTRACTS;
    if (!normalized) return source;
    return source.filter((contract) =>
      [
        contract.contractCode,
        contract.name,
        contract.customerName,
        contract.customerCode,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [keyword, workspaceQuery.data?.contracts]);

  const deleteMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: async () => {
      toast.success('Đã xóa hợp đồng.');
      setDeletingContract(null);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'contracts'],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function openCreate() {
    navigate(ROUTES.PROJECT.CONTRACT_CREATE);
  }

  function openEdit(contract: Contract) {
    navigate(
      `${ROUTES.PROJECT.CONTRACT_CREATE}?edit=${encodeURIComponent(contract.id)}`,
    );
  }

  const columns = useContractColumns({
    onEdit: openEdit,
    onDelete: setDeletingContract,
  });
  const table = useReactTable({
    data: contracts,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  if (workspaceQuery.isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được danh sách hợp đồng</CardTitle>
            <CardDescription className="mt-1">
              {getApiErrorMessage(workspaceQuery.error)}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => workspaceQuery.refetch()}>
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
        recordCount={contracts.length}
        isLoading={workspaceQuery.isLoading}
        emptyMessage="Chưa có hợp đồng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý hợp đồng</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <SearchInput
                className="w-72"
                placeholder="Tìm theo mã, tên hoặc khách hàng"
                value={keyword}
                debounceMs={0}
                onSearch={(value) => {
                  setKeyword(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
              />
              <Button
                variant="outline"
                onClick={() => workspaceQuery.refetch()}
              >
                <RefreshCw />
                Làm mới
              </Button>
              <ShortcutTooltip label="Thêm hợp đồng" shortcut="Alt + N">
                <Button
                  variant="primary"
                  onClick={openCreate}
                  data-shortcut-action="create"
                >
                  <Plus />
                  Thêm hợp đồng
                </Button>
              </ShortcutTooltip>
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

      <ConfirmDialog
        open={Boolean(deletingContract)}
        onOpenChange={(open) => {
          if (!open) setDeletingContract(null);
        }}
        title="Xóa hợp đồng?"
        description={
          deletingContract
            ? `Bạn có chắc muốn xóa hợp đồng "${deletingContract.name}"?`
            : ''
        }
        confirmLabel="Xóa hợp đồng"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deletingContract) deleteMutation.mutate(deletingContract.id);
        }}
      />
    </div>
  );
}
