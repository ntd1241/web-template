import { useEffect, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog';
import { SPEC_DEFINITIONS_MOCK } from '../../data/spec-definitions.mock';
import type {
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../../model/spec-definition';
import { useSpecDefinitionColumns } from '../components/spec-definition-columns.generated';
import {
  mapSpecDefinitionToFormValues,
  specDefinitionDefaultValues,
  SpecDefinitionFormDialog,
  useSpecDefinitionForm,
} from '../components/spec-definition-form.generated';
import type { SpecDefinitionFormValues } from '../spec-definition.schema';

let createdSeq = 0;

export function SpecDefinitionsPage() {
  const [specs, setSpecs] = useState<SpecDefinition[]>(SPEC_DEFINITIONS_MOCK);
  const [keyword, setKeyword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SpecDefinition | null>(null);
  const [deleting, setDeleting] = useState<SpecDefinition | null>(null);

  const form = useSpecDefinitionForm();

  useEffect(() => {
    if (!isDialogOpen) return;
    form.reset(
      editing
        ? mapSpecDefinitionToFormValues(editing)
        : specDefinitionDefaultValues,
    );
  }, [form, isDialogOpen, editing]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return specs;
    return specs.filter(
      (spec) =>
        spec.name.toLowerCase().includes(kw) ||
        spec.code.toLowerCase().includes(kw),
    );
  }, [specs, keyword]);

  const handleCreate = () => {
    setEditing(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (row: SpecDefinition) => {
    setEditing(row);
    setIsDialogOpen(true);
  };

  const handleSubmit = (values: SpecDefinitionFormValues) => {
    const isList = values.dataType === 'list';
    const options = isList
      ? values.options.map((opt) => ({
          id: opt.id,
          label: opt.label.trim(),
          value: opt.value.trim(),
          colorHex: opt.colorHex,
        }))
      : undefined;
    const next: SpecDefinition = {
      id: editing?.id ?? `spec-new-${(createdSeq += 1)}`,
      code: values.code.trim(),
      name: values.name.trim(),
      dataType: values.dataType,
      unit:
        values.dataType === 'number'
          ? values.unit.trim() || undefined
          : undefined,
      description: values.description.trim() || undefined,
      allowMultiple: isList ? values.allowMultiple : false,
      allowDynamicValues: isList ? values.allowDynamicValues : false,
      allowModelOverride: values.allowModelOverride,
      defaultValue: normalizeDefaultValue(values, options),
      options,
    };

    setSpecs((prev) =>
      editing
        ? prev.map((spec) => (spec.id === editing.id ? next : spec))
        : [next, ...prev],
    );
    toast.success(
      editing ? `Đã cập nhật "${next.name}"` : `Đã thêm "${next.name}"`,
    );
    setIsDialogOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    setSpecs((prev) => prev.filter((spec) => spec.id !== deleting.id));
    toast.success(`Đã xóa "${deleting.name}"`);
    setDeleting(null);
  };

  const columns = useSpecDefinitionColumns({
    onEdit: handleEdit,
    onDelete: setDeleting,
  });

  const table = useReactTable({
    data: filtered,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={filtered.length}
        emptyMessage="Chưa có thông số nào"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Danh mục thông số kỹ thuật</CardTitle>
              <CardDescription>
                Định nghĩa thông số dùng chung khi tạo mẫu vật tư
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm theo tên / mã"
                  variant="md"
                  className="w-56 pl-8"
                />
              </div>
              <Button variant="primary" onClick={handleCreate}>
                <Plus className="size-4" />
                Thêm thông số
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

      <SpecDefinitionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        form={form}
        onSubmit={handleSubmit}
        title={editing ? 'Sửa thông số kỹ thuật' : 'Thêm thông số kỹ thuật'}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa thông số kỹ thuật"
        description={`Bạn chắc chắn muốn xóa "${deleting?.name ?? ''}"? Hành động không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

function normalizeDefaultValue(
  values: SpecDefinitionFormValues,
  options: SpecOption[] | undefined,
): SpecValue | undefined {
  switch (values.dataType) {
    case 'number': {
      const value = values.defaultValue;
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !Number.isNaN(value.amount)
      ) {
        return { amount: value.amount, unit: values.unit.trim() || undefined };
      }
      return undefined;
    }
    case 'boolean':
      return typeof values.defaultValue === 'boolean'
        ? values.defaultValue
        : undefined;
    case 'list': {
      const allowedIds = new Set((options ?? []).map((option) => option.id));
      if (values.allowMultiple) {
        return Array.isArray(values.defaultValue)
          ? values.defaultValue.filter((id) => allowedIds.has(id))
          : undefined;
      }
      return typeof values.defaultValue === 'string' &&
        allowedIds.has(values.defaultValue)
        ? values.defaultValue
        : undefined;
    }
    case 'date':
    case 'text':
      return typeof values.defaultValue === 'string' &&
        values.defaultValue.trim()
        ? values.defaultValue.trim()
        : undefined;
    default:
      return undefined;
  }
}
