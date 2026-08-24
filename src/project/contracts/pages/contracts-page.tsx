import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useUser } from '@/providers/user-provider';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { deleteContract } from '../api/contracts.api';
import { useContractList } from '../hooks/use-contract-list';
import {
  type Contract,
} from '../model/contract';
import { useContractColumns } from '../table/contract.columns.generated';
import { ContractFilterBar } from '../table/contract.filters.generated';

export function ContractsPage() {
  const navigate = useNavigate();
  const { userId } = useUser();
  const queryClient = useQueryClient();
  const [deletingContract, setDeletingContract] = useState<Contract | null>(
    null,
  );
  const {
    contracts,
    total,
    keyword,
    setKeyword,
    filters,
    setFilters,
    setFilter,
    pagination,
    onPaginationChange,
    tenantQuery,
    workspaceQuery,
    customerOptions,
    customerOptionsQuery,
  } = useContractList();

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
    contractSearch: filters.contractSearch,
    onContractSearchChange: (value) => setFilter('contractSearch', value),
    customerId: filters.customerId,
    customerOptions,
    customerOptionsLoading: customerOptionsQuery.isPending,
    onCustomerIdChange: (value) => setFilter('customerId', value),
    statuses: filters.status,
    onStatusChange: (value) => setFilter('status', value),
    outstandingMin: filters.outstandingMin,
    outstandingMax: filters.outstandingMax,
    onOutstandingChange: (value) => {
      setFilters((current) => ({
        ...current,
        outstandingMin: value.min,
        outstandingMax: value.max,
      }));
    },
    nextDueFrom: filters.nextDueFrom,
    nextDueTo: filters.nextDueTo,
    onNextDueChange: (value) => {
      setFilters((current) => ({
        ...current,
        nextDueFrom: value.from ?? '',
        nextDueTo: value.to ?? '',
      }));
    },
  });
  const table = useReactTable({
    data: contracts,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
  });

  const listError = tenantQuery.error ?? workspaceQuery.error;
  const isListLoading = tenantQuery.isPending || workspaceQuery.isLoading;

  if (tenantQuery.isError || workspaceQuery.isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được danh sách hợp đồng</CardTitle>
            <CardDescription className="mt-1">
              {getApiErrorMessage(listError)}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              void tenantQuery.refetch();
              void workspaceQuery.refetch();
            }}
          >
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
        isLoading={isListLoading}
        emptyMessage="Chưa có hợp đồng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý hợp đồng</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <ContractFilterBar
                keyword={keyword}
                onKeywordChange={setKeyword}
              />
              <Button
                variant="outline"
                mode="icon"
                aria-label="Làm mới"
                title="Làm mới"
                onClick={() => workspaceQuery.refetch()}
              >
                <RefreshCw />
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
