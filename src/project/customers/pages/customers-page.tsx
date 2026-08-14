import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
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
import { Tag as TagBadge } from '@/components/ui/tag';
import {
  createCustomer,
  deleteCustomer,
  loadCustomerTagFilter,
  loadCustomerWorkspace,
  updateCustomer,
} from '../api/customers.api';
import {
  CustomerFormDialog,
  useCustomerForm,
} from '../forms/customer-form.generated';
import {
  emptyCustomerForm,
  mapCustomerToFormValues,
  type Customer,
  type CustomerFormValues,
} from '../model/customer';
import { useCustomerColumns } from '../table/customer.columns.generated';

const EMPTY_CUSTOMERS: Customer[] = [];

export function CustomersPage() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const [keyword, setKeyword] = useState('');
  const [customerTagId, setCustomerTagId] = useState('all');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const form = useCustomerForm();

  const workspaceQuery = useQuery({
    queryKey: ['project', 'customers', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadCustomerWorkspace(userId);
    },
    enabled: Boolean(userId),
  });

  const customerTagFilterQuery = useQuery({
    queryKey: [
      'project',
      'customers',
      'tag-filter',
      userId,
      workspaceQuery.data?.tenantId,
    ],
    queryFn: () => loadCustomerTagFilter(workspaceQuery.data!.tenantId),
    enabled: Boolean(workspaceQuery.data?.tenantId),
  });

  const customers = useMemo(() => {
    const source = workspaceQuery.data?.customers ?? EMPTY_CUSTOMERS;
    const normalized = keyword.trim().toLowerCase();
    const selectedCustomerIds =
      customerTagId === 'all'
        ? null
        : new Set(
            customerTagFilterQuery.data?.customerIdsByTagId[customerTagId] ??
              [],
          );

    return source.filter((customer) => {
      if (selectedCustomerIds && !selectedCustomerIds.has(customer.id)) {
        return false;
      }
      if (!normalized) return true;
      return [
        customer.customerCode,
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }, [
    customerTagFilterQuery.data?.customerIdsByTagId,
    customerTagId,
    keyword,
    workspaceQuery.data?.customers,
  ]);

  const customerTagOptions = customerTagFilterQuery.data?.options ?? [];
  const selectedCustomerTag = customerTagOptions.find(
    (option) => option.value === customerTagId,
  );

  const invalidateCustomers = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'customers', userId],
    });

  const saveMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => {
      if (editingCustomer) return updateCustomer(editingCustomer.id, values);
      const tenantId = workspaceQuery.data?.tenantId;
      if (!tenantId) throw new Error('Chưa xác định tenant.');
      return createCustomer(tenantId, values);
    },
    onSuccess: async () => {
      toast.success(
        editingCustomer ? 'Đã cập nhật khách hàng.' : 'Đã tạo khách hàng.',
      );
      setDialogOpen(false);
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
    form.reset(emptyCustomerForm);
    setDialogOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    form.reset(mapCustomerToFormValues(customer));
    setDialogOpen(true);
  }

  const columns = useCustomerColumns({
    onEdit: openEdit,
    onDelete: (customer) => {
      if (
        window.confirm(`Bạn có chắc muốn xóa khách hàng "${customer.name}"?`)
      ) {
        deleteMutation.mutate(customer.id);
      }
    },
  });
  const table = useReactTable({
    data: customers,
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
            <CardTitle>Không tải được danh sách khách hàng</CardTitle>
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
        recordCount={customers.length}
        isLoading={workspaceQuery.isLoading}
        emptyMessage="Chưa có khách hàng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý khách hàng</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <SearchInput
                className="w-64"
                placeholder="Tìm theo tên hoặc mã khách hàng"
                value={keyword}
                debounceMs={0}
                onSearch={setKeyword}
              />
              <Select
                value={customerTagId}
                onValueChange={(value) => {
                  setCustomerTagId(value);
                  setPagination((current) => ({ ...current, pageIndex: 0 }));
                }}
                disabled={customerTagFilterQuery.isLoading}
              >
                <SelectTrigger className="w-48" aria-label="Nhóm khách hàng">
                  <SelectValue label="Nhóm" placeholder="Nhóm khách hàng">
                    {customerTagId === 'all' ? (
                      'Tất cả'
                    ) : selectedCustomerTag ? (
                      <TagBadge color={selectedCustomerTag.color} size="sm">
                        {selectedCustomerTag.label}
                      </TagBadge>
                    ) : (
                      'Nhóm khách hàng'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {customerTagOptions.map((option) => (
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
              <Button variant="primary" onClick={openCreate}>
                <Plus />
                Thêm khách hàng
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

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={editingCustomer ? 'edit' : 'create'}
        form={form}
        onSubmit={(values) => saveMutation.mutate(values)}
        isSaving={saveMutation.isPending}
        title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
      />
    </div>
  );
}
