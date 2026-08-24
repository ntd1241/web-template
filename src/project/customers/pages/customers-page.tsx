import { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  createCustomer,
  deleteCustomer,
  loadCustomerRegionOptions,
  updateCustomer,
  uploadCustomerImage,
} from '../api/customers.api';
import {
  CustomerFormDialog,
  useCustomerForm,
} from '../forms/customer-form.generated';
import { useCustomerList } from '../hooks/use-customer-list';
import {
  emptyCustomerForm,
  mapCustomerToFormValues,
  type Customer,
  type CustomerFormValues,
} from '../model/customer';
import { useCustomerColumns } from '../table/customer.columns.generated';
import { CustomerFilterBar } from '../table/customer.filters.generated';

export function CustomersPage() {
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );
  const [customerImageFile, setCustomerImageFile] = useState<File | null>(null);
  const form = useCustomerForm();

  const {
    customers,
    total,
    keyword,
    setKeyword,
    filters,
    setFilter,
    pagination,
    onPaginationChange,
    tenantQuery,
    workspaceQuery,
    customerTagOptions,
    customerTagOptionsQuery,
  } = useCustomerList();

  const customerRegionQuery = useQuery({
    queryKey: ['project', 'customers', 'regions'],
    queryFn: loadCustomerRegionOptions,
  });

  const invalidateCustomers = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'customers'],
    });

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
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={isListLoading}
        emptyMessage="Chưa có khách hàng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý khách hàng</CardTitle>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <CustomerFilterBar
                keyword={keyword}
                onKeywordChange={setKeyword}
                tag={filters.tagId}
                onTagChange={(value) => setFilter('tagId', value)}
                tagOptions={[
                  { value: 'all', label: 'Tất cả nhóm' },
                  ...customerTagOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  })),
                ]}
                tagRenderOption={(option) => {
                  const tag = customerTagOptions.find(
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
                tagRenderValue={(option) => {
                  const tag = customerTagOptions.find(
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
                disabled={customerTagOptionsQuery.isLoading}
              />
              <Button
                variant="outline"
                onClick={() => void workspaceQuery.refetch()}
              >
                <RefreshCw />
                Làm mới
              </Button>
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
        onImageUrlFileChange={setCustomerImageFile}
        regionCodeOptions={customerRegionQuery.data ?? []}
        isSaving={saveMutation.isPending}
        title={editingCustomer ? 'Sửa khách hàng' : 'Thêm khách hàng'}
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
    </div>
  );
}
