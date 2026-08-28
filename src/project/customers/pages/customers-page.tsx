import { useCallback, useMemo, useState } from 'react';
import {
  createTenantSavedView,
  deleteTenantSavedView,
  loadTenantSavedViews,
  updateTenantSavedView,
} from '@/project/saved-views/api/saved-views.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
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
import {
  createCustomer,
  deleteCustomer,
  loadCustomerRegionOptions,
  updateCustomer,
  uploadCustomerImage,
} from '../api/customers.api';
import { CustomerFilterDrawer } from '../components/customer-filter-drawer';
import { CustomerSavedViews } from '../components/customer-saved-views';
import {
  CustomerFormDialog,
  useCustomerForm,
} from '../forms/customer-form.generated';
import {
  CustomerSavedViewFormDialog,
  useCustomerSavedViewForm,
} from '../forms/customer-saved-view-form.generated';
import { useCustomerList } from '../hooks/use-customer-list';
import {
  CUSTOMER_STATUS_LABELS,
  emptyCustomerForm,
  mapCustomerToFormValues,
  type Customer,
  type CustomerFilterFormValues,
  type CustomerFormValues,
  type CustomerListFilters,
} from '../model/customer';
import {
  CUSTOMER_SAVED_VIEW_MANAGE_PERMISSION,
  CUSTOMER_SAVED_VIEW_RESOURCE,
  customerSavedViewConfigEquals,
  normalizeCustomerSavedViewConfig,
  type CustomerSavedView,
  type CustomerSavedViewConfig,
} from '../model/customer-saved-view';
import { useCustomerColumns } from '../table/customer.columns.generated';
import { CustomerFilterBar } from '../table/customer.filters.generated';

const customerStatItems = [
  {
    key: 'total',
    label: 'Tổng số',
    filterValue: null,
    className: '!bg-muted !text-muted-foreground',
  },
  {
    key: 'active',
    label: CUSTOMER_STATUS_LABELS.active,
    filterValue: 'active',
    className: '!bg-admin-success-bg !text-admin-success-text',
  },
  {
    key: 'inactive',
    label: CUSTOMER_STATUS_LABELS.inactive,
    filterValue: 'inactive',
    className: '!bg-muted !text-muted-foreground',
  },
] satisfies readonly StatusStatItem<'active' | 'inactive'>[];

export function CustomersPage() {
  const { tenantId } = useTenant();
  const { userId, hasPermission } = useUser();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [customerImageFile, setCustomerImageFile] = useState<File | null>(null);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<CustomerSavedView | null>(
    null,
  );
  const [deletingView, setDeletingView] = useState<CustomerSavedView | null>(
    null,
  );
  const form = useCustomerForm();
  const savedViewForm = useCustomerSavedViewForm();

  const {
    customers,
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
    customerTagsByCustomerId,
  } = useCustomerList();

  const savedViewsQuery = useQuery({
    queryKey: [
      'project',
      'saved-views',
      tenantId,
      CUSTOMER_SAVED_VIEW_RESOURCE,
    ],
    queryFn: ({ signal }) =>
      loadTenantSavedViews<CustomerListFilters>(
        tenantId!,
        CUSTOMER_SAVED_VIEW_RESOURCE,
        signal,
      ),
    enabled: Boolean(tenantId),
    staleTime: 60 * 1000,
  });

  const customerRegionQuery = useQuery({
    queryKey: ['project', 'customers', 'regions'],
    queryFn: loadCustomerRegionOptions,
  });

  const { columnVisibility, onColumnVisibilityChange } =
    usePersistedColumnVisibility('project.customers.columnVisibility');
  const { columnOrder, onColumnOrderChange } = usePersistedColumnOrder(
    'project.customers.columnOrder',
  );

  const currentViewConfig = useMemo<CustomerSavedViewConfig>(
    () => ({
      version: 1,
      keyword,
      filters,
      columnVisibility,
      columnOrder,
    }),
    [columnOrder, columnVisibility, filters, keyword],
  );
  const savedViews = savedViewsQuery.data ?? [];
  const activeView =
    savedViews.find((view) => view.id === activeViewId) ?? null;
  const isActiveViewDirty = Boolean(
    activeView &&
    !customerSavedViewConfigEquals(
      currentViewConfig,
      normalizeCustomerSavedViewConfig(activeView.config),
    ),
  );
  const canManageSavedViews = hasPermission(
    CUSTOMER_SAVED_VIEW_MANAGE_PERMISSION,
  );

  const invalidateCustomers = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'customers'],
    });

  const invalidateSavedViews = () =>
    queryClient.invalidateQueries({
      queryKey: [
        'project',
        'saved-views',
        tenantId,
        CUSTOMER_SAVED_VIEW_RESOURCE,
      ],
    });

  function selectSavedView(viewId: string | null) {
    if (!viewId) {
      setActiveViewId(null);
      resetAll();
      return;
    }

    const view = savedViews.find((candidate) => candidate.id === viewId);
    if (!view) return;

    const config = normalizeCustomerSavedViewConfig(view.config);
    setActiveViewId(view.id);
    setKeyword(config.keyword);
    setFilters({
      ...config.filters,
      businessTypes: [...config.filters.businessTypes],
      statuses: [...config.filters.statuses],
      tagIds: [...config.filters.tagIds],
    });
    onColumnVisibilityChange(config.columnVisibility);
    onColumnOrderChange(config.columnOrder);
  }

  function openCreateSavedView() {
    setEditingView(null);
    savedViewForm.reset({ name: '' });
    setViewDialogOpen(true);
  }

  function openEditSavedView(view: CustomerSavedView) {
    selectSavedView(view.id);
    setEditingView(view);
    savedViewForm.reset({ name: view.name });
    setViewDialogOpen(true);
  }

  const savedViewMutation = useMutation({
    mutationFn: async ({
      name,
      view,
      config,
    }: {
      name: string;
      view: CustomerSavedView | null;
      config?: CustomerSavedViewConfig;
    }) => {
      if (!tenantId || !userId) {
        throw new Error('Chưa xác định tenant hoặc tài khoản đăng nhập.');
      }

      const nextConfig = config ?? currentViewConfig;

      return view
        ? updateTenantSavedView(tenantId, userId, view, name, nextConfig)
        : createTenantSavedView(
            tenantId,
            userId,
            CUSTOMER_SAVED_VIEW_RESOURCE,
            name,
            nextConfig,
          );
    },
    onSuccess: async (view, variables) => {
      setActiveViewId(view.id);
      setViewDialogOpen(false);
      setEditingView(null);
      await invalidateSavedViews();
      toast.success(
        variables.view
          ? 'Đã cập nhật chế độ xem.'
          : 'Đã tạo chế độ xem dùng chung.',
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteSavedViewMutation = useMutation({
    mutationFn: (view: CustomerSavedView) => {
      if (!tenantId) throw new Error('Chưa xác định tenant.');
      return deleteTenantSavedView(tenantId, view.id);
    },
    onSuccess: async (_, view) => {
      if (activeViewId === view.id) {
        setActiveViewId(null);
        resetAll();
      }
      setDeletingView(null);
      await invalidateSavedViews();
      toast.success('Đã xóa chế độ xem.');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function saveCurrentView(config = currentViewConfig) {
    if (!activeView) return;

    savedViewMutation.mutate({
      name: activeView.name,
      view: activeView,
      config,
    });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      if (!tenantId) throw new Error('Chưa xác định tenant.');

      if (editingCustomer) {
        const imageUrl = customerImageFile
          ? await uploadCustomerImage(
              tenantId,
              editingCustomer.id,
              customerImageFile,
            )
          : values.imageUrl;

        return updateCustomer(editingCustomer.id, { ...values, imageUrl });
      }

      const createdCustomer = await createCustomer(tenantId, values);
      if (customerImageFile) {
        const imageUrl = await uploadCustomerImage(
          tenantId,
          createdCustomer.id,
          customerImageFile,
        );
        return updateCustomer(createdCustomer.id, { ...values, imageUrl });
      }

      return createdCustomer;
    },
    onSuccess: async () => {
      toast.success(
        editingCustomer ? 'Đã cập nhật khách hàng.' : 'Đã tạo khách hàng.',
      );
      setDialogOpen(false);
      setCustomerImageFile(null);
      await invalidateCustomers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      toast.success('Đã xóa khách hàng.');
      await invalidateCustomers();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function openCreate() {
    setEditingCustomer(null);
    setCustomerImageFile(null);
    form.reset(emptyCustomerForm);
    setDialogOpen(true);
  }

  const openEdit = useCallback(
    (customer: Customer) => {
      setEditingCustomer(customer);
      setCustomerImageFile(null);
      form.reset(mapCustomerToFormValues(customer));
      setDialogOpen(true);
    },
    [form],
  );

  const columns = useCustomerColumns({
    onEdit: openEdit,
    onDelete: setDeletingCustomer,
    tagIds: filters.tagIds,
    onTagIdsChange: (value) => setFilter('tagIds', value),
    tagsByCustomerId: customerTagsByCustomerId,
    customerSearch: filters.customerSearch,
    onCustomerSearchChange: (value) => setFilter('customerSearch', value),
    businessTypes: filters.businessTypes,
    onBusinessTypesChange: (value) =>
      setFilter('businessTypes', value as typeof filters.businessTypes),
    contactSearch: filters.contactSearch,
    onContactSearchChange: (value) => setFilter('contactSearch', value),
    statuses: filters.statuses,
    onStatusesChange: (value) =>
      setFilter('statuses', value as typeof filters.statuses),
  });
  const table = useReactTable({
    data: customers,
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

  const pageHeader = (
    <PageHeader
      title="Khách hàng"
      titleAside={
        <CustomerSavedViews
          views={savedViews}
          activeViewId={activeViewId}
          canManage={canManageSavedViews}
          isLoading={savedViewsQuery.isPending}
          isDirty={isActiveViewDirty}
          isSaving={savedViewMutation.isPending}
          onSelect={selectSavedView}
          onCreate={openCreateSavedView}
          onEdit={openEditSavedView}
          onSaveCurrent={() => saveCurrentView()}
        />
      }
      actions={
        <ShortcutTooltip label="Thêm khách hàng" shortcut="Alt + N">
          <Button
            variant="primary"
            onClick={openCreate}
            data-shortcut-action="create"
          >
            <Plus />
            Thêm khách hàng
          </Button>
        </ShortcutTooltip>
      }
    />
  );

  if (tenantQuery.isError || workspaceQuery.isError) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:gap-5 lg:p-5">
        {pageHeader}
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được danh sách khách hàng</CardTitle>
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
        emptyMessage="Chưa có khách hàng"
        tableLayout={{ dense: true, columnsVisibility: false }}
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <DataGridHeader
            variant="stats"
            stats={
              <StatusStats
                items={customerStatItems}
                counts={statusStatsQuery.data}
                isLoading={statusStatsQuery.isPending}
                activeFilters={filters.statuses}
                onFilterChange={(status) =>
                  setFilter('statuses', status ? [status] : [])
                }
                ariaLabel="Lọc khách hàng theo trạng thái"
              />
            }
            toolbar={
              <>
                <CustomerFilterBar
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
                <CustomerFilterDrawer
                  filters={filters}
                  onApply={(values: CustomerFilterFormValues) =>
                    setFilters(values)
                  }
                  onReset={() =>
                    setFilters({
                      customerSearch: '',
                      businessTypes: [],
                      contactSearch: '',
                      tagIds: [],
                      statuses: [],
                    })
                  }
                  onSaveToView={
                    canManageSavedViews
                      ? (values) =>
                          saveCurrentView({
                            ...currentViewConfig,
                            filters: values,
                          })
                      : undefined
                  }
                  canSaveToView={Boolean(activeView && canManageSavedViews)}
                  saveDisabled={!isActiveViewDirty}
                  isSaving={savedViewMutation.isPending}
                />
                <DataGridColumnVisibility
                  table={table}
                  mode="drawer"
                  onSaveToView={
                    canManageSavedViews ? () => saveCurrentView() : undefined
                  }
                  canSaveToView={Boolean(activeView && canManageSavedViews)}
                  saveDisabled={!isActiveViewDirty}
                  isSaving={savedViewMutation.isPending}
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingCustomer ? 'edit' : 'create'}
        form={form}
        onSubmit={(values) => saveMutation.mutate(values)}
        onImageUrlFileChange={setCustomerImageFile}
        regionCodeOptions={customerRegionQuery.data ?? []}
        isSaving={saveMutation.isPending}
        title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
      />
      <CustomerSavedViewFormDialog
        open={viewDialogOpen}
        mode={editingView ? 'edit' : 'create'}
        form={savedViewForm}
        isSaving={savedViewMutation.isPending}
        onOpenChange={(open) => {
          setViewDialogOpen(open);
          if (!open) setEditingView(null);
        }}
        onSubmit={(values) =>
          savedViewMutation.mutate({ name: values.name, view: editingView })
        }
        title={editingView ? 'Sửa chế độ xem' : 'Tạo chế độ xem'}
        onDelete={() => {
          if (!editingView) return;
          setViewDialogOpen(false);
          setEditingView(null);
          setDeletingView(editingView);
        }}
      />
      <ConfirmDialog
        open={Boolean(deletingCustomer)}
        onOpenChange={(open) => {
          if (!open) setDeletingCustomer(null);
        }}
        title="Xóa khách hàng?"
        description={
          deletingCustomer
            ? `Bạn có chắc muốn xóa khách hàng "${deletingCustomer.name}"?`
            : ''
        }
        confirmLabel="Xóa khách hàng"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deletingCustomer) deleteMutation.mutate(deletingCustomer.id);
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
          if (deletingView) deleteSavedViewMutation.mutate(deletingView);
        }}
      />
    </div>
  );
}
