import { useCallback, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from '@tanstack/react-table';
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
import { DataGridActionBar } from '@/components/ui/data-grid-action-bar';
import { usePersistedColumnVisibility } from '@/components/ui/data-grid-columns';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useSetEmployeesStatusMutation,
  useSetEmployeeStatusMutation,
} from '../api/employee.queries';
import { CreateEmployeeDialog } from '../components/create-employee-dialog';
import { EmployeesToolbar } from '../components/employees-toolbar';
import { useEmployeeColumns } from '../hooks/use-employee-columns';
import { useEmployeeList } from '../hooks/use-employee-list';
import {
  EMPLOYEE_STATUS_LABELS,
  type Employee,
  type EmployeeRole,
  type EmployeeStatus,
} from '../model/employee';

export function EmployeesExamplePage() {
  const [roleFilter, setRoleFilter] = useState<EmployeeRole[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkStatus, setBulkStatus] = useState<EmployeeStatus>('active');
  const {
    keyword,
    onKeywordChange,
    pagination,
    onPaginationChange,
    employees,
    total,
    isLoading,
    isError,
    refetch,
  } = useEmployeeList();

  // Demo: bật sẵn quyền quản lý để thấy đủ UI. Trong dự án thật:
  //   const canManage = useAuthStore((s) => s.hasPermission('employees.manage'));
  const canManage = true;

  const {
    mutate: setStatus,
    isPending,
    variables,
  } = useSetEmployeeStatusMutation();
  const pendingId = isPending ? (variables?.id ?? null) : null;

  const handleToggleStatus = useCallback(
    (employee: Employee) => {
      setStatus({
        id: employee.id,
        status: employee.status === 'locked' ? 'active' : 'locked',
      });
    },
    [setStatus],
  );

  const columns = useEmployeeColumns({
    canManage,
    pendingId,
    onToggleStatus: handleToggleStatus,
  });
  const filteredEmployees = useMemo(() => {
    if (roleFilter.length === 0) {
      return employees;
    }

    return employees.filter((employee) =>
      employee.roles.some((role) => roleFilter.includes(role)),
    );
  }, [employees, roleFilter]);
  const filteredTotal =
    roleFilter.length === 0 ? total : filteredEmployees.length;
  const { columnVisibility, onColumnVisibilityChange } =
    usePersistedColumnVisibility('examples.employees.columnVisibility');

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    getRowId: (row) => row.id,
    state: { pagination, columnVisibility, rowSelection },
    onPaginationChange,
    onColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    manualPagination: true,
    pageCount: Math.max(1, Math.ceil(filteredTotal / pagination.pageSize)),
    getCoreRowModel: getCoreRowModel(),
  });

  const { mutate: setStatusBulk } = useSetEmployeesStatusMutation();

  const handleBulkStatus = useCallback(() => {
    const ids = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original.id);
    if (ids.length === 0) return;

    setStatusBulk(
      { ids, status: bulkStatus },
      { onSuccess: () => table.resetRowSelection() },
    );
  }, [table, setStatusBulk, bulkStatus]);

  if (isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-admin-red-primary" />
          <div>
            <CardTitle>Không tải được danh sách</CardTitle>
            <CardDescription className="mt-1">
              Đã có lỗi khi tải dữ liệu nhân viên.
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
        recordCount={filteredTotal}
        isLoading={isLoading}
        emptyMessage="Không tìm thấy nhân viên phù hợp"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Danh sách nhân viên</CardTitle>
              <CardDescription>
                Quản lý tài khoản truy cập hệ thống
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <EmployeesToolbar
                keyword={keyword}
                onKeywordChange={onKeywordChange}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                onRefresh={() => refetch()}
                onCreate={() => setIsCreateOpen(true)}
                canManage={canManage}
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

        {canManage ? (
          <DataGridActionBar>
            <Select
              value={bulkStatus}
              onValueChange={(value) => setBulkStatus(value as EmployeeStatus)}
            >
              <SelectTrigger size="sm" className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  {EMPLOYEE_STATUS_LABELS.active}
                </SelectItem>
                <SelectItem value="locked">
                  {EMPLOYEE_STATUS_LABELS.locked}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="primary" size="sm" onClick={handleBulkStatus}>
              Áp dụng
            </Button>
          </DataGridActionBar>
        ) : null}
      </DataGrid>

      <CreateEmployeeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
