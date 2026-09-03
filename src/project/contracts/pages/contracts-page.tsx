import { useMemo, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import {
  SavedViewFormDialog,
  useSavedViewForm,
} from '@/project/saved-views/components/saved-view-form-dialog';
import { SavedViewsToolbar } from '@/project/saved-views/components/saved-views-toolbar';
import { useTenantSavedViews } from '@/project/saved-views/hooks/use-tenant-saved-views';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardTable,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnVisibility } from '@/components/ui/data-grid-column-visibility';
import {
  usePersistedColumnOrder,
  usePersistedColumnVisibility,
} from '@/components/ui/data-grid-columns';
import { DataGridHeader } from '@/components/ui/data-grid-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { PageHeader } from '@/components/ui/page-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { StatusStats, type StatusStatItem } from '@/components/ui/status-stats';
import { deleteContract } from '../api/contracts.api';
import { useContractList } from '../hooks/use-contract-list';
import {
  type Contract,
  type ContractListFilters,
  type ContractStatus,
} from '../model/contract';
import {
  CONTRACT_SAVED_VIEW_MANAGE_PERMISSION,
  CONTRACT_SAVED_VIEW_RESOURCE,
  contractSavedViewConfigEquals,
  normalizeContractSavedViewConfig,
  type ContractSavedView,
  type ContractSavedViewConfig,
} from '../model/contract-saved-view';
import { useContractColumns } from '../table/contract.columns.generated';
import { ContractFilterBar } from '../table/contract.filters.generated';

export function ContractsPage() {
  const navigate = useNavigate();
  const { tenantId } = useTenant();
  const { userId, hasPermission } = useUser();
  const queryClient = useQueryClient();
  const [deletingContract, setDeletingContract] = useState<Contract | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<ContractSavedView | null>(
    null,
  );
  const [deletingView, setDeletingView] = useState<ContractSavedView | null>(
    null,
  );
  const viewForm = useSavedViewForm();
  const {
    contracts,
    total,
    keyword,
    setKeyword,
    filters,
    setFilters,
    setFilter,
    resetAll,
    pagination,
    onPaginationChange,
    tenantQuery,
    workspaceQuery,
    statusStatsQuery,
    customerOptions,
    customerOptionsQuery,
    paymentReminderDays,
    contractRenewalReminderDays,
  } = useContractList();
  const savedViewState = useTenantSavedViews<ContractListFilters>({
    tenantId,
    userId,
    resource: CONTRACT_SAVED_VIEW_RESOURCE,
  });

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
    paymentReminderDays,
    contractRenewalReminderDays,
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
  const { columnVisibility, onColumnVisibilityChange } =
    usePersistedColumnVisibility('project.contracts.columnVisibility');
  const { columnOrder, onColumnOrderChange } = usePersistedColumnOrder(
    'project.contracts.columnOrder',
  );
  const currentViewConfig = useMemo<ContractSavedViewConfig>(
    () => ({ version: 1, keyword, filters, columnVisibility, columnOrder }),
    [columnOrder, columnVisibility, filters, keyword],
  );
  const activeView = savedViewState.activeView;
  const isActiveViewDirty = Boolean(
    activeView &&
    !contractSavedViewConfigEquals(
      currentViewConfig,
      normalizeContractSavedViewConfig(activeView.config),
    ),
  );
  const canManageSavedViews = hasPermission(
    CONTRACT_SAVED_VIEW_MANAGE_PERMISSION,
  );

  function selectSavedView(viewId: string | null) {
    if (!viewId) {
      savedViewState.setActiveViewId(null);
      resetAll();
      return;
    }
    const view = savedViewState.savedViews.find((item) => item.id === viewId);
    if (!view) return;
    const config = normalizeContractSavedViewConfig(view.config);
    savedViewState.setActiveViewId(view.id);
    setKeyword(config.keyword);
    setFilters({ ...config.filters, status: [...config.filters.status] });
    onColumnVisibilityChange(config.columnVisibility);
    onColumnOrderChange(config.columnOrder);
  }

  function openCreateSavedView() {
    setEditingView(null);
    viewForm.reset({ name: '' });
    setViewDialogOpen(true);
  }

  function openEditSavedView(view: ContractSavedView) {
    selectSavedView(view.id);
    setEditingView(view);
    viewForm.reset({ name: view.name });
    setViewDialogOpen(true);
  }

  function saveView(config = currentViewConfig) {
    if (!activeView) return;
    savedViewState.saveMutation.mutate(
      { name: activeView.name, view: activeView, config },
      {
        onSuccess: () => toast.success('Đã cập nhật chế độ xem.'),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }

  function submitSavedView(name: string) {
    savedViewState.saveMutation.mutate(
      { name, view: editingView, config: currentViewConfig },
      {
        onSuccess: () => {
          setViewDialogOpen(false);
          setEditingView(null);
          toast.success(
            editingView
              ? 'Đã cập nhật chế độ xem.'
              : 'Đã tạo chế độ xem dùng chung.',
          );
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    );
  }
  const pageHeader = (
    <PageHeader
      title="Quản lý hợp đồng"
      titleAside={
        <SavedViewsToolbar
          views={savedViewState.savedViews}
          activeViewId={savedViewState.activeViewId}
          canManage={canManageSavedViews}
          isLoading={savedViewState.savedViewsQuery.isPending}
          isDirty={isActiveViewDirty}
          isSaving={savedViewState.saveMutation.isPending}
          onSelect={selectSavedView}
          onCreate={openCreateSavedView}
          onEdit={openEditSavedView}
          onSaveCurrent={() => saveView()}
        />
      }
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

  const table = useReactTable({
    data: contracts,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, columnVisibility, columnOrder },
    onPaginationChange,
    onColumnVisibilityChange,
    onColumnOrderChange,
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
        isFetching={workspaceQuery.isFetching}
        emptyMessage="Chưa có hợp đồng"
        tableLayout={{ dense: true, columnsVisibility: false }}
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <DataGridHeader
            variant="stats"
            stats={
              <StatusStats
                items={contractStatItems}
                counts={statusStatsQuery.data}
                isLoading={statusStatsQuery.isPending}
                activeFilters={filters.status}
                onFilterChange={(status) =>
                  setFilter('status', status ? [status] : [])
                }
                ariaLabel="Lọc hợp đồng theo trạng thái"
              />
            }
            toolbar={
              <>
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
                <DataGridColumnVisibility
                  table={table}
                  mode="drawer"
                  onSaveToView={
                    canManageSavedViews ? () => saveView() : undefined
                  }
                  canSaveToView={Boolean(activeView && canManageSavedViews)}
                  saveDisabled={!isActiveViewDirty}
                  isSaving={savedViewState.saveMutation.isPending}
                />
              </>
            }
          />
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
      <SavedViewFormDialog
        open={viewDialogOpen}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setEditingView(null);
        }}
        mode={editingView ? 'edit' : 'create'}
        form={viewForm}
        isSaving={savedViewState.saveMutation.isPending}
        title={editingView ? 'Sửa chế độ xem' : 'Tạo chế độ xem'}
        onSubmit={(values) => submitSavedView(values.name)}
        onDelete={() => {
          if (!editingView) return;
          setViewDialogOpen(false);
          setEditingView(null);
          setDeletingView(editingView);
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingView)}
        onOpenChange={(open) => {
          if (!open) setDeletingView(null);
        }}
        title="Xóa chế độ xem?"
        description={
          deletingView
            ? `Chế độ xem "${deletingView.name}" sẽ bị xóa cho toàn bộ tenant.`
            : ''
        }
        confirmLabel="Xóa chế độ xem"
        confirmVariant="destructive"
        onConfirm={() => {
          if (!deletingView) return;
          savedViewState.deleteMutation.mutate(deletingView, {
            onSuccess: () => {
              setDeletingView(null);
              toast.success('Đã xóa chế độ xem.');
            },
            onError: (error) => toast.error(getApiErrorMessage(error)),
          });
        }}
      />
    </div>
  );
}

const contractStatItems = [
  {
    key: 'total',
    label: 'Tổng số',
    filterValue: null,
    className: '!bg-muted !text-muted-foreground',
  },
  {
    key: 'active',
    label: 'Đang hiệu lực',
    filterValue: 'active',
    className: '!bg-admin-success-bg !text-admin-success-text',
  },
  {
    key: 'expiring',
    label: 'Sắp hết hạn',
    filterValue: 'active',
    className: '!bg-admin-amber-bg !text-admin-amber-dark',
  },
  {
    key: 'expired',
    label: 'Đã hết hạn',
    filterValue: 'expired',
    className: '!bg-admin-red-bg !text-admin-red-dark',
  },
] satisfies readonly StatusStatItem<ContractStatus>[];
