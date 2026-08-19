import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Tag as TagBadge } from '@/components/ui/tag';
import {
  createEmployee,
  deleteEmployee,
  loadEmployeeTagFilter,
  loadEmployeeWorkspace,
  updateEmployee,
} from '../api/employees.api';
import {
  EmployeeFormDialog,
  useEmployeeForm,
} from '../forms/employee-form.generated';
import {
  emptyEmployeeForm,
  mapEmployeeToFormValues,
  type Employee,
  type EmployeeFormValues,
} from '../model/employee';
import { useEmployeeColumns } from '../table/employee.columns.generated';

export function EmployeesPage() {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [employeeTagId, setEmployeeTagId] = useState('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null,
  );
  const form = useEmployeeForm();

  const workspaceQuery = useQuery({
    queryKey: ['project', 'employees', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadEmployeeWorkspace(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
  });

  const employeeTagFilterQuery = useQuery({
    queryKey: [
      'project',
      'employees',
      'tag-filter',
      userId,
      workspaceQuery.data?.tenantId,
    ],
    queryFn: () => loadEmployeeTagFilter(workspaceQuery.data!.tenantId),
    enabled: Boolean(workspaceQuery.data?.tenantId),
  });

  const employees = useMemo(() => {
    const source = workspaceQuery.data?.employees ?? [];
    const normalized = keyword.trim().toLowerCase();
    const selectedEmployeeIds =
      employeeTagId === 'all'
        ? null
        : new Set(
            employeeTagFilterQuery.data?.employeeIdsByTagId[employeeTagId] ??
              [],
          );

    return source.filter((employee) => {
      if (selectedEmployeeIds && !selectedEmployeeIds.has(employee.id)) {
        return false;
      }
      if (!normalized) return true;
      return [
        employee.employeeCode,
        employee.displayName,
        employee.department,
        employee.jobTitle,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [
    employeeTagFilterQuery.data?.employeeIdsByTagId,
    employeeTagId,
    keyword,
    workspaceQuery.data?.employees,
  ]);

  const employeeTagOptions = employeeTagFilterQuery.data?.options ?? [];
  const selectedEmployeeTag = employeeTagOptions.find(
    (option) => option.value === employeeTagId,
  );

  const invalidateEmployees = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'employees', userId],
    });

  const saveMutation = useMutation({
    mutationFn: (values: EmployeeFormValues) => {
      if (editingEmployee) return updateEmployee(editingEmployee.id, values);
      const tenantId = workspaceQuery.data?.tenantId;
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
  });
  const table = useReactTable({
    data: employees,
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
            <CardTitle>Không tải được danh sách nhân viên</CardTitle>
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
        recordCount={employees.length}
        isLoading={workspaceQuery.isLoading}
        emptyMessage="Chưa có nhân viên"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý nhân viên</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <SearchInput
                className="w-64"
                placeholder="Tìm theo tên hoặc mã nhân viên"
                value={keyword}
                debounceMs={0}
                onSearch={setKeyword}
              />
              <Select
                value={employeeTagId}
                onValueChange={(value) => {
                  setEmployeeTagId(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                disabled={employeeTagFilterQuery.isLoading}
              >
                <SelectTrigger className="w-48" aria-label="Nhóm nhân viên">
                  <SelectValue label="Nhóm" placeholder="Nhóm nhân viên">
                    {employeeTagId === 'all' ? (
                      'Tất cả'
                    ) : selectedEmployeeTag ? (
                      <TagBadge color={selectedEmployeeTag.color} size="sm">
                        {selectedEmployeeTag.label}
                      </TagBadge>
                    ) : (
                      'Nhóm nhân viên'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {employeeTagOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      textValue={option.label}
                    >
                      <TagBadge color={option.color} size="sm">
                        {option.label}
                      </TagBadge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => workspaceQuery.refetch()}
              >
                <RefreshCw />
                Làm mới
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
