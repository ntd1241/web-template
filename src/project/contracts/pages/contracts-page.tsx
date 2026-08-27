import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { PageHeader } from '@/components/ui/page-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { deleteContract } from '../api/contracts.api';
import { useContractList } from '../hooks/use-contract-list';
import {
  type Contract,
  type ContractStatus,
  type ContractStatusStats,
} from '../model/contract';
import { useContractColumns } from '../table/contract.columns.generated';
import { ContractFilterBar } from '../table/contract.filters.generated';

export function ContractsPage() {
  const navigate = useNavigate();
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
    statusStatsQuery,
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

  const pageHeader = (
    <PageHeader
      title="Quản lý hợp đồng"
      actions={
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
      }
    />
  );

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
      <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:gap-5 lg:p-5">
        {pageHeader}
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
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:gap-5 lg:p-5">
      {pageHeader}
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={isListLoading}
        emptyMessage="Chưa có hợp đồng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <ContractStatusStats
              stats={statusStatsQuery.data}
              isLoading={statusStatsQuery.isPending}
              statuses={filters.status}
              onStatusChange={(status) =>
                setFilter('status', status ? [status] : [])
              }
            />
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
                onClick={() => {
                  void workspaceQuery.refetch();
                  void statusStatsQuery.refetch();
                }}
              >
                <RefreshCw />
              </Button>
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

type ContractStatusStatsProps = {
  stats?: ContractStatusStats;
  isLoading: boolean;
  statuses: ContractStatus[];
  onStatusChange: (status: ContractStatus | null) => void;
};

const contractStatItems = [
  {
    key: 'total',
    label: 'Tổng số',
    filterStatus: null,
    className: '!bg-muted !text-muted-foreground',
  },
  {
    key: 'active',
    label: 'Đang hiệu lực',
    filterStatus: 'active',
    className: '!bg-admin-success-bg !text-admin-success-text',
  },
  {
    key: 'expiring',
    label: 'Sắp hết hạn',
    filterStatus: 'active',
    className: '!bg-admin-amber-bg !text-admin-amber-dark',
  },
  {
    key: 'expired',
    label: 'Đã hết hạn',
    filterStatus: 'expired',
    className: '!bg-admin-red-bg !text-admin-red-dark',
  },
] as const;

function ContractStatusStats({
  stats,
  isLoading,
  statuses,
  onStatusChange,
}: ContractStatusStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {contractStatItems.map((item, index) => (
        <div key={item.key} className="flex items-center gap-2.5">
          {index > 0 ? <span className="h-5 w-px bg-border" /> : null}
          <Badge asChild variant="secondary" size="lg">
            <button
              type="button"
              className={`gap-2 rounded-lg border-transparent px-3 transition-shadow hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring ${item.className}`}
              aria-label={`Lọc hợp đồng: ${item.label}`}
              aria-pressed={
                item.filterStatus === null
                  ? statuses.length === 0
                  : statuses.length === 1 && statuses[0] === item.filterStatus
              }
              onClick={() => onStatusChange(item.filterStatus)}
            >
              <span>{item.label}</span>
              <span className="font-bold tabular-nums">
                {isLoading ? '—' : (stats?.[item.key] ?? '—')}
              </span>
            </button>
          </Badge>
        </div>
      ))}
    </div>
  );
}
