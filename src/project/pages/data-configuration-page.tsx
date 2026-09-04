import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  Database,
  FileText,
  Plus,
  Trash2,
  UserRoundSearch,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PageLoading } from '@/components/ui/loading';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  createCustomField,
  deleteCustomField,
  loadCustomFields,
  updateCustomField,
} from '../data-configuration/api/custom-fields.api';
import {
  CustomFieldForm,
  useCustomFieldForm,
} from '../data-configuration/forms/custom-field-form.generated';
import {
  CUSTOM_FIELD_ENTITY_META,
  CUSTOM_FIELD_ENTITY_TYPES,
  emptyCustomFieldForm,
  type CustomField,
  type CustomFieldEntityType,
  type CustomFieldFormValues,
  type CustomFieldOptionInput,
} from '../data-configuration/model/custom-field';
import { useCustomFieldColumns } from '../data-configuration/table/custom-field.columns.generated';

const ENTITY_ICONS = {
  customer: UserRoundSearch,
  employee: Users,
  contract: FileText,
} satisfies Record<CustomFieldEntityType, typeof Database>;

export function DataConfigurationPage() {
  const { tenantId } = useTenant();
  const { hasPermission } = useUser();
  const canView = hasPermission('organization:custom-field:view');
  const canCreate = hasPermission('organization:custom-field:create');
  const canUpdate = hasPermission('organization:custom-field:update');
  const canDelete = hasPermission('organization:custom-field:delete');
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] =
    useState<CustomFieldEntityType>('customer');
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deletingField, setDeletingField] = useState<CustomField | null>(null);
  const [optionDrafts, setOptionDrafts] = useState<CustomFieldOptionInput[]>(
    [],
  );
  const fieldForm = useCustomFieldForm();
  const fieldsQuery = useQuery({
    queryKey: ['project', 'custom-fields', tenantId, selectedEntity],
    queryFn: () => {
      if (!tenantId) throw new Error('Chưa xác định tổ chức hiện tại.');
      return loadCustomFields(tenantId, selectedEntity);
    },
    enabled: Boolean(tenantId && canView),
  });
  const fields = fieldsQuery.data ?? [];
  const invalidateFields = () =>
    queryClient.invalidateQueries({
      queryKey: ['project', 'custom-fields', tenantId, selectedEntity],
    });

  const saveMutation = useMutation({
    mutationFn: async (values: CustomFieldFormValues) => {
      if (!tenantId) throw new Error('Chưa xác định tổ chức hiện tại.');
      if (editingField && !canUpdate) {
        throw new Error('Bạn không có quyền chỉnh sửa trường bổ sung.');
      }
      if (!editingField && !canCreate) {
        throw new Error('Bạn không có quyền thêm trường bổ sung.');
      }

      const options = optionDrafts
        .map((option) => ({
          value: option.value.trim(),
          label: option.label.trim(),
        }))
        .filter((option) => option.value || option.label);

      if (values.fieldType === 'select') {
        if (
          options.length === 0 ||
          options.some((option) => !option.value || !option.label)
        ) {
          throw new Error('Vui lòng nhập đầy đủ ít nhất một lựa chọn.');
        }
        if (
          new Set(options.map((option) => option.value)).size !== options.length
        ) {
          throw new Error('Giá trị lựa chọn không được trùng nhau.');
        }
      }

      if (editingField) {
        return updateCustomField(editingField.id, values, options);
      }
      return createCustomField(tenantId, selectedEntity, values, options);
    },
    onSuccess: async () => {
      toast.success(
        editingField ? 'Đã cập nhật trường bổ sung.' : 'Đã tạo trường bổ sung.',
      );
      setFieldDialogOpen(false);
      await invalidateFields();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (field: CustomField) => deleteCustomField(field.id),
    onSuccess: async () => {
      toast.success('Đã xóa trường bổ sung.');
      setDeletingField(null);
      await invalidateFields();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const openCreateDialog = () => {
    setEditingField(null);
    fieldForm.reset(emptyCustomFieldForm);
    setOptionDrafts([{ value: '', label: '' }]);
    setFieldDialogOpen(true);
  };

  const openEditDialog = (field: CustomField) => {
    setEditingField(field);
    fieldForm.reset({
      label: field.label,
      key: field.key,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      isActive: field.isActive,
    });
    setOptionDrafts(
      field.options.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    );
    setFieldDialogOpen(true);
  };

  const columns = useCustomFieldColumns({
    onEdit: openEditDialog,
    onDelete: setDeletingField,
    canEdit: canUpdate,
    canDelete,
  });
  const table = useReactTable({
    data: fields,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!tenantId) {
    return (
      <PageLoading label="Đang tải tổ chức hiện tại..." className="h-full" />
    );
  }

  if (!canView) {
    return (
      <div className="flex h-full items-center justify-center p-4 lg:p-5">
        <Card className="flex max-w-lg flex-col items-center gap-3 p-10 text-center">
          <Database className="size-8 text-muted-foreground" />
          <CardTitle>Bạn không có quyền xem cấu hình dữ liệu</CardTitle>
        </Card>
      </div>
    );
  }

  if (fieldsQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-4 lg:p-5">
        <Card className="flex max-w-lg flex-col items-center gap-3 p-10 text-center">
          <Database className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được cấu hình dữ liệu</CardTitle>
          </div>
          <Button variant="outline" onClick={() => fieldsQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 overflow-y-auto p-4 xl:flex-row xl:overflow-hidden xl:p-5">
      <Card className="max-h-[220px] w-full shrink-0 overflow-hidden xl:max-h-none xl:w-[260px]">
        <CardHeader className="min-h-0 flex-col items-start gap-1 p-4">
          <CardTitle className="text-[15px]">Đối tượng</CardTitle>
        </CardHeader>
        <CardContent className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-auto p-3 sm:grid-cols-3 xl:flex xl:flex-col">
          {CUSTOM_FIELD_ENTITY_TYPES.map((entityType) => {
            const Icon = ENTITY_ICONS[entityType];
            const meta = CUSTOM_FIELD_ENTITY_META[entityType];
            const isSelected = entityType === selectedEntity;

            return (
              <button
                key={entityType}
                type="button"
                className={`flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/8 text-foreground'
                    : 'border-border bg-background hover:bg-field'
                }`}
                onClick={() => setSelectedEntity(entityType)}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    {meta.label}
                  </span>
                </span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <DataGrid
        table={table}
        recordCount={fields.length}
        isLoading={fieldsQuery.isPending}
        isFetching={fieldsQuery.isFetching}
        emptyMessage="Chưa có trường bổ sung cho đối tượng này"
      >
        <Card className="min-h-0 w-full min-w-0 flex-1 overflow-hidden">
          <CardHeader className="shrink-0 flex-col items-stretch gap-1 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle className="flex items-center gap-2 text-[18px]">
                <Database className="size-5 text-primary" />
                Trường bổ sung: {CUSTOM_FIELD_ENTITY_META[selectedEntity].label}
              </CardTitle>
            </CardHeading>
            <CardToolbar>
              {canCreate ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={openCreateDialog}
                >
                  <Plus className="size-4" />
                  Thêm trường
                </Button>
              ) : null}
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

      <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
        <DialogContent className="flex max-h-[90dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 space-y-1.5 px-6 py-5 text-start">
            <DialogTitle>
              {editingField
                ? `Chỉnh sửa trường bổ sung cho ${CUSTOM_FIELD_ENTITY_META[selectedEntity].label.toLowerCase()}`
                : `Thêm trường bổ sung cho ${CUSTOM_FIELD_ENTITY_META[selectedEntity].label.toLowerCase()}`}
            </DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <CustomFieldForm
              form={fieldForm}
              onSubmit={(values) => saveMutation.mutate(values)}
              id="custom-field-form"
            />
            {fieldForm.watch('fieldType') === 'select' ? (
              <div className="mt-5 space-y-3 border-t pt-5">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    Danh sách lựa chọn
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Giá trị lưu là mã ổn định; nhãn hiển thị là nội dung người
                    dùng nhìn thấy.
                  </div>
                </div>
                {optionDrafts.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option.value}
                      placeholder="Giá trị lưu"
                      onChange={(event) =>
                        setOptionDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Input
                      value={option.label}
                      placeholder="Nhãn hiển thị"
                      onChange={(event) =>
                        setOptionDrafts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, label: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      appearance="ghost"
                      mode="icon"
                      size="sm"
                      aria-label={`Xóa lựa chọn ${index + 1}`}
                      disabled={optionDrafts.length <= 1}
                      onClick={() =>
                        setOptionDrafts((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setOptionDrafts((current) => [
                      ...current,
                      { value: '', label: '' },
                    ])
                  }
                >
                  <Plus className="size-4" />
                  Thêm lựa chọn
                </Button>
              </div>
            ) : null}
          </div>
          <DialogFooter className="shrink-0 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFieldDialogOpen(false)}
              disabled={saveMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="custom-field-form"
              loading={saveMutation.isPending}
              loadingText="Đang lưu..."
            >
              Lưu trường
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deletingField)}
        onOpenChange={(open) => {
          if (!open) setDeletingField(null);
        }}
        title="Xóa trường bổ sung?"
        description={
          deletingField
            ? `Bạn có chắc muốn xóa trường "${deletingField.label}"?`
            : ''
        }
        confirmLabel="Xóa trường"
        confirmVariant="destructive"
        onConfirm={() => {
          if (deletingField) deleteMutation.mutate(deletingField);
        }}
      />
    </div>
  );
}
