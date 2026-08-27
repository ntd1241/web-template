import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
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
import { Tag as TagBadge } from '@/components/ui/tag';
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
  emptyEmployeeForm,
  mapEmployeeToFormValues,
  type Employee,
  type EmployeeFormValues,
} from '../model/employee';
import { useEmployeeColumns } from '../table/employee.columns.generated';
import { EmployeeFilterBar } from '../table/employee.filters.generated';

export function EmployeesPage() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );
  const form = useEmployeeForm();

  const {
    employees,
    total,
    keyword,
    setKeyword,
    filters,
    setFilter,
    pagination,
    onPaginationChange,
    tenantQuery,
    workspaceQuery,
    employeeTagOptions,
    employeeTagOptionsQuery,
    employeeRoleOptions,
    employeeRoleOptionsQuery,
  } = useEmployeeList();

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
  const table = useReactTable({
    data: employees,
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
      <div className="p-4 lg:p-5">
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
    <div className="flex h-full min-h-0 flex-col p-4 lg:p-5">
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={isListLoading}
        emptyMessage="Chưa có nhân viên"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý nhân viên</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <EmployeeFilterBar
                tag={filters.tagId}
                onTagChange={(value) => setFilter('tagId', value)}
                tagOptions={[
                  { value: 'all', label: 'Tất cả nhóm' },
                  ...employeeTagOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
                renderTagOption={(option) => {
                  const tag = employeeTagOptions.find(
                    (item) => item.value === option.value,
                  );
                  return tag ? (
                    <TagBadge color={tag.color} size="sm">
                      {tag.label}
                    </TagBadge>
                  ) : (
                    option.label
                  );
                }}
                renderTagValue={(option) => {
                  const tag = employeeTagOptions.find(
                    (item) => item.value === option?.value,
                  );
                  return tag ? (
                    <TagBadge color={tag.color} size="sm">
                      {tag.label}
                    </TagBadge>
                  ) : (
                    option?.label
                  );
                }}
                disabled={employeeTagOptionsQuery.isLoading}
              />
              <Button
                variant="outline"
                mode="icon"
                aria-label="Làm mới"
                title="Làm mới"
                onClick={() => void workspaceQuery.refetch()}
              >
                <RefreshCw />
              </Button>
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

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onSubmit={(values) => saveMutation.mutate(values)}
        isSaving={saveMutation.isPending}
        title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
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
    </div>
  );
}
