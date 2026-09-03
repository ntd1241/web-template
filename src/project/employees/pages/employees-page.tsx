import { useMemo, useState } from 'react';
import {
  SavedViewFormDialog,
  useSavedViewForm,
} from '@/project/saved-views/components/saved-view-form-dialog';
import { SavedViewsToolbar } from '@/project/saved-views/components/saved-views-toolbar';
import { useTenantSavedViews } from '@/project/saved-views/hooks/use-tenant-saved-views';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from '../api/employees.api';
import {
  EmployeeFormDialog,
  useEmployeeForm,
} from '../forms/employee-form.generated';
import { useEmployeeList } from '../hooks/use-employee-list';
import {
  EMPLOYEE_STATUS_LABELS,
  emptyEmployeeForm,
  mapEmployeeToFormValues,
  type Employee,
  type EmployeeFormValues,
  type EmployeeListFilters,
} from '../model/employee';
import {
  EMPLOYEE_SAVED_VIEW_MANAGE_PERMISSION,
  EMPLOYEE_SAVED_VIEW_RESOURCE,
  employeeSavedViewConfigEquals,
  normalizeEmployeeSavedViewConfig,
  type EmployeeSavedView,
  type EmployeeSavedViewConfig,
} from '../model/employee-saved-view';
import { useEmployeeColumns } from '../table/employee.columns.generated';
import { EmployeeFilterBar } from '../table/employee.filters.generated';

const employeeStatItems = [
  {
    key: 'total',
    label: 'Tổng số',
    filterValue: null,
    className: '!bg-muted !text-muted-foreground',
  },
  {
    key: 'active',
    label: EMPLOYEE_STATUS_LABELS.active,
    filterValue: 'active',
    className: '!bg-admin-success-bg !text-admin-success-text',
  },
  {
    key: 'inactive',
    label: EMPLOYEE_STATUS_LABELS.inactive,
    filterValue: 'inactive',
    className: '!bg-muted !text-muted-foreground',
  },
] satisfies readonly StatusStatItem<'active' | 'inactive'>[];

export function EmployeesPage() {
  const { tenantId } = useTenant();
  const { userId, hasPermission } = useUser();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingView, setEditingView] = useState<EmployeeSavedView | null>(
    null,
  );
  const [deletingView, setDeletingView] = useState<EmployeeSavedView | null>(
    null,
  );
  const form = useEmployeeForm();
  const viewForm = useSavedViewForm();

  const {
    employees,
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
    employeeTagsByEmployeeId,
    employeeRoleOptions,
    employeeRoleOptionsQuery,
  } = useEmployeeList();

  const savedViewState = useTenantSavedViews<EmployeeListFilters>({
    tenantId,
    userId,
    resource: EMPLOYEE_SAVED_VIEW_RESOURCE,
  });

  const invalidateEmployees = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'employees'],
    });

  const saveMutation = useMutation({
    mutationFn: (values: EmployeeFormValues) => {
      if (editingEmployee) return updateEmployee(editingEmployee.id, values);
      if (!tenantId) throw new Error('Chưa xác định tenant.');
      return createEmployee(tenantId, values);
    },
    onSuccess: async () => {
      toast.success(
        editingEmployee ? 'Đã cập nhật nhân viên.' : 'Đã tạo nhân viên.',
      );
      setDialogOpen(false);
      await invalidateEmployees();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      toast.success('Đã xóa nhân viên.');
      await invalidateEmployees();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  function openCreate() {
    setEditingEmployee(null);
    form.reset(emptyEmployeeForm);
    setDialogOpen(true);
  }

  function openEdit(employee: Employee) {
    setEditingEmployee(employee);
    form.reset(mapEmployeeToFormValues(employee));
    setDialogOpen(true);
  }

  const columns = useEmployeeColumns({
    onEdit: openEdit,
    onDelete: setDeletingEmployee,
    tagIds: filters.tagIds,
    onTagIdsChange: (value) => setFilter('tagIds', value),
    tagsByEmployeeId: employeeTagsByEmployeeId,
    employeeSearch: keyword,
    onEmployeeSearchChange: setKeyword,
    roleIds: filters.roleIds,
    roleOptions: employeeRoleOptions,
    roleOptionsLoading: employeeRoleOptionsQuery.isLoading,
    onRoleIdsChange: (value) => setFilter('roleIds', value),
    statuses: filters.statuses,
    onStatusesChange: (value) => setFilter('statuses', value),
    accountLinked: filters.accountLinked === 'all' ? '' : filters.accountLinked,
    onAccountLinkedChange: (value) =>
      setFilter(
        'accountLinked',
        value === '' ? 'all' : (value as 'linked' | 'unlinked'),
      ),
  });
  const { columnVisibility, onColumnVisibilityChange } =
    usePersistedColumnVisibility('project.employees.columnVisibility');
  const { columnOrder, onColumnOrderChange } = usePersistedColumnOrder(
    'project.employees.columnOrder',
  );
  const currentViewConfig = useMemo<EmployeeSavedViewConfig>(
    () => ({ version: 1, keyword, filters, columnVisibility, columnOrder }),
    [columnOrder, columnVisibility, filters, keyword],
  );
  const activeView = savedViewState.activeView;
  const isActiveViewDirty = Boolean(
    activeView &&
    !employeeSavedViewConfigEquals(
      currentViewConfig,
      normalizeEmployeeSavedViewConfig(activeView.config),
    ),
  );
  const canManageSavedViews = hasPermission(
    EMPLOYEE_SAVED_VIEW_MANAGE_PERMISSION,
  );

  function selectSavedView(viewId: string | null) {
    if (!viewId) {
      savedViewState.setActiveViewId(null);
      resetAll();
      return;
    }
    const view = savedViewState.savedViews.find((item) => item.id === viewId);
    if (!view) return;
    const config = normalizeEmployeeSavedViewConfig(view.config);
    savedViewState.setActiveViewId(view.id);
    setKeyword(config.keyword);
    setFilters({
      ...config.filters,
      statuses: [...config.filters.statuses],
      roleIds: [...config.filters.roleIds],
      tagIds: [...config.filters.tagIds],
    });
    onColumnVisibilityChange(config.columnVisibility);
    onColumnOrderChange(config.columnOrder);
  }

  function openCreateSavedView() {
    setEditingView(null);
    viewForm.reset({ name: '' });
    setViewDialogOpen(true);
  }

  function openEditSavedView(view: EmployeeSavedView) {
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
      title="Nhân viên"
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
        <ShortcutTooltip label="Thêm nhân viên" shortcut="Alt + N">
          <Button
            variant="primary"
            onClick={openCreate}
            data-shortcut-action="create"
          >
            <Plus />
            Thêm nhân viên
          </Button>
        </ShortcutTooltip>
      }
    />
  );

  const table = useReactTable({
    data: employees,
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
            <CardTitle>Không tải được danh sách nhân viên</CardTitle>
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
        emptyMessage="Chưa có nhân viên"
        tableLayout={{ dense: true, columnsVisibility: false }}
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <DataGridHeader
            variant="stats"
            stats={
              <StatusStats
                items={employeeStatItems}
                counts={statusStatsQuery.data}
                isLoading={statusStatsQuery.isPending}
                activeFilters={filters.statuses}
                onFilterChange={(status) =>
                  setFilter('statuses', status ? [status] : [])
                }
                ariaLabel="Lọc nhân viên theo trạng thái"
              />
            }
            toolbar={
              <>
                <EmployeeFilterBar
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

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onSubmit={(values) => saveMutation.mutate(values)}
        isSaving={saveMutation.isPending}
        title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
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
        open={Boolean(deletingEmployee)}
        onOpenChange={(open) => {
          if (!open) setDeletingEmployee(null);
        }}
        title="Xóa nhân viên?"
        description={
          deletingEmployee
            ? `Bạn có chắc muốn xóa nhân viên "${deletingEmployee.displayName}"?`
            : ''
        }
        confirmLabel="Xóa nhân viên"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deletingEmployee) deleteMutation.mutate(deletingEmployee.id);
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
