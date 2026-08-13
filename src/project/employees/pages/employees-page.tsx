import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, Search, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  createEmployee,
  deleteEmployee,
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
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const form = useEmployeeForm();

  const workspaceQuery = useQuery({
    queryKey: ['project', 'employees', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadEmployeeWorkspace(userId);
    },
    enabled: Boolean(userId),
  });

  const employees = useMemo(() => {
    const source = workspaceQuery.data?.employees ?? [];
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return source;
    return source.filter((employee) =>
      [
        employee.employeeCode,
        employee.displayName,
        employee.department,
        employee.jobTitle,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [keyword, workspaceQuery.data?.employees]);

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
    onDelete: (employee) => {
      if (
        window.confirm(
          `Bạn có chắc muốn xóa nhân viên "${employee.displayName}"?`,
        )
      ) {
        deleteMutation.mutate(employee.id);
      }
    },
  });
  const table = useReactTable({
    data: employees,
    columns,
    getRowId: (row) => row.id,
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
            <div>
              <CardTitle>Quản lý nhân viên</CardTitle>
              <CardDescription>
                Quản lý hồ sơ nhân sự và liên kết tài khoản truy cập.
              </CardDescription>
            </div>
            <CardToolbar className="flex-wrap">
              <div className="relative">
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm nhân viên..."
                  className="w-56 ps-8"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => workspaceQuery.refetch()}
              >
                <RefreshCw className="size-4" />
                Làm mới
              </Button>
              <Button variant="primary" size="sm" onClick={openCreate}>
                <Plus className="size-4" />
                Thêm nhân viên
              </Button>
            </CardToolbar>
          </CardHeader>
          <CardTable className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
        </Card>
      </DataGrid>

      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={form}
        onSubmit={(values) => saveMutation.mutate(values)}
        title={editingEmployee ? 'Sửa nhân viên' : 'Thêm nhân viên'}
      />
    </div>
  );
}
