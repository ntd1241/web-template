import { useEffect, useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog';
import { MATERIAL_MODELS_MOCK } from '../../data/material-models.mock';
import { SPEC_DEFINITIONS_MOCK } from '../../data/spec-definitions.mock';
import { SPEC_VALUE_SETS_MOCK } from '../../data/spec-value-sets.mock';
import type {
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../../model/spec-definition';
import {
  SPEC_VALUE_SET_KIND_LABELS,
  type SpecValueSet,
} from '../../model/spec-value-set';
import { useSpecDefinitionColumns } from '../components/spec-definition-columns.generated';
import {
  mapSpecDefinitionToFormValues,
  specDefinitionDefaultValues,
  SpecDefinitionFormDialog,
  useSpecDefinitionForm,
} from '../components/spec-definition-form.generated';
import type { SpecDefinitionFormValues } from '../spec-definition.schema';

let createdSeq = 0;
let valueSetSeq = 0;
let optionSeq = 0;

export function SpecDefinitionsPage() {
  const [specs, setSpecs] = useState<SpecDefinition[]>(SPEC_DEFINITIONS_MOCK);
  const [valueSets, setValueSets] = useState<SpecValueSet[]>(
    SPEC_VALUE_SETS_MOCK,
  );
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
    const selectedValueSet = valueSets.find(
      (set) => set.id === values.defaultValueSetId,
    );
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
      defaultValueSetId: isList ? values.defaultValueSetId || undefined : undefined,
      defaultSelectionMode: isList ? values.defaultSelectionMode : undefined,
      allowModelSelectionOverride: isList
        ? values.allowModelSelectionOverride
        : false,
      allowModelValueSetOverride: isList
        ? values.allowModelValueSetOverride
        : false,
      defaultValue: normalizeDefaultValue(
        values,
        isList ? selectedValueSet?.options : undefined,
      ),
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
    valueSets,
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
      <Tabs defaultValue="specs" className="flex min-h-0 flex-1 flex-col">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <TabsList variant="line">
            <TabsTrigger value="specs">Thông số</TabsTrigger>
            <TabsTrigger value="value-sets">Value sets</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="specs" className="mt-0 min-h-0 flex-1">
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
        </TabsContent>

        <TabsContent value="value-sets" className="mt-0 min-h-0 flex-1">
          <ValueSetsSurface
            valueSets={valueSets}
            specs={specs}
            onChange={setValueSets}
          />
        </TabsContent>
      </Tabs>

      <SpecDefinitionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        form={form}
        valueSets={valueSets}
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

function ValueSetsSurface({
  valueSets,
  specs,
  onChange,
}: {
  valueSets: SpecValueSet[];
  specs: SpecDefinition[];
  onChange: (valueSets: SpecValueSet[]) => void;
}) {
  const [selectedId, setSelectedId] = useState(valueSets[0]?.id ?? '');
  const selected = valueSets.find((set) => set.id === selectedId);
  const usageByValueSet = useMemo(
    () => buildValueSetUsage(valueSets, specs),
    [valueSets, specs],
  );

  const updateSelected = (patch: Partial<SpecValueSet>) => {
    if (!selected) return;
    onChange(
      valueSets.map((set) =>
        set.id === selected.id ? { ...set, ...patch } : set,
      ),
    );
  };

  const handleCreate = () => {
    const id = `vs-new-${(valueSetSeq += 1)}`;
    onChange([
      {
        id,
        code: `VS-NEW-${valueSetSeq}`,
        name: 'Value set mới',
        kind: 'generic',
        options: [],
        isActive: true,
      },
      ...valueSets,
    ]);
    setSelectedId(id);
  };

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_26rem] gap-4">
      <Card className="min-h-0 overflow-hidden">
        <CardHeader className="p-5">
          <CardHeading>
            <CardTitle>Value sets</CardTitle>
            <CardDescription>
              Quản lý bảng giá trị dùng lại cho thông số dạng danh sách
            </CardDescription>
          </CardHeading>
          <CardToolbar>
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="size-4" />
              Thêm value set
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardTable className="min-h-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên / mã</TableHead>
                <TableHead className="w-28">Kind</TableHead>
                <TableHead className="w-28 text-right">Số option</TableHead>
                <TableHead className="w-28 text-right">Dùng bởi</TableHead>
                <TableHead className="w-28">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {valueSets.map((set) => {
                const isSelected = set.id === selectedId;
                return (
                  <TableRow
                    key={set.id}
                    className={isSelected ? 'bg-admin-surface-alt' : undefined}
                    onClick={() => setSelectedId(set.id)}
                  >
                    <TableCell>
                      <div className="flex min-w-0 flex-col">
                        <span className="font-medium text-foreground">
                          {set.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {set.code}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" appearance="light">
                        {SPEC_VALUE_SET_KIND_LABELS[set.kind]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {set.options.length}
                    </TableCell>
                    <TableCell className="text-right">
                      {usageByValueSet.get(set.id) ?? 0}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={set.isActive ? 'success' : 'secondary'}
                        appearance="light"
                      >
                        {set.isActive ? 'Đang dùng' : 'Tạm ẩn'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardTable>
      </Card>

      <ValueSetEditor valueSet={selected} onChange={updateSelected} />
    </div>
  );
}

function ValueSetEditor({
  valueSet,
  onChange,
}: {
  valueSet: SpecValueSet | undefined;
  onChange: (patch: Partial<SpecValueSet>) => void;
}) {
  const [bulkText, setBulkText] = useState('');

  if (!valueSet) {
    return (
      <Card className="p-5 text-sm text-muted-foreground">
        Chọn một value set để chỉnh sửa.
      </Card>
    );
  }

  const updateOption = (index: number, patch: Partial<SpecOption>) => {
    onChange({
      options: valueSet.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    });
  };

  const handleAddOption = () => {
    optionSeq += 1;
    const id = `${valueSet.code.toLowerCase()}-${optionSeq}`;
    onChange({
      options: [...valueSet.options, { id, label: '', value: id }],
    });
  };

  const handleBulkPaste = () => {
    const pasted = bulkText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [code, label, colorHex] = line.split(/\t|,/).map((part) => part.trim());
        const id = code || `opt-${(optionSeq += 1)}`;
        return {
          id,
          value: code || id,
          label: label || code || id,
          colorHex: valueSet.kind === 'color' ? colorHex || undefined : undefined,
        };
      });
    onChange({ options: [...valueSet.options, ...pasted] });
    setBulkText('');
  };

  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader className="p-5">
        <CardHeading>
          <CardTitle>Chi tiết value set</CardTitle>
          <CardDescription>{valueSet.name}</CardDescription>
        </CardHeading>
      </CardHeader>
      <div className="grid min-h-0 gap-4 overflow-y-auto p-5 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <Input
            variant="sm"
            value={valueSet.name}
            onChange={(event) => onChange({ name: event.target.value })}
          />
          <Input
            variant="sm"
            value={valueSet.code}
            onChange={(event) => onChange({ code: event.target.value })}
          />
          <Select
            value={valueSet.kind}
            onValueChange={(kind: SpecValueSet['kind']) => onChange({ kind })}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generic">Chung</SelectItem>
              <SelectItem value="color">Màu sắc</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={valueSet.isActive ? 'active' : 'inactive'}
            onValueChange={(value) => onChange({ isActive: value === 'active' })}
          >
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Đang dùng</SelectItem>
              <SelectItem value="inactive">Tạm ẩn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Option
            </span>
            <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
              <Plus className="size-3.5" />
              Thêm
            </Button>
          </div>
          {valueSet.options.map((option, index) => (
            <div
              key={option.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-2"
            >
              <Input
                variant="sm"
                placeholder="code"
                value={option.value}
                onChange={(event) =>
                  updateOption(index, { value: event.target.value })
                }
              />
              <Input
                variant="sm"
                placeholder="label"
                value={option.label}
                onChange={(event) =>
                  updateOption(index, { label: event.target.value })
                }
              />
              {valueSet.kind === 'color' && (
                <Input
                  type="color"
                  variant="sm"
                  aria-label="Màu hiển thị"
                  className="h-7 w-10 p-1"
                  value={option.colorHex ?? '#ffffff'}
                  onChange={(event) =>
                    updateOption(index, { colorHex: event.target.value })
                  }
                />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xóa option"
                onClick={() =>
                  onChange({
                    options: valueSet.options.filter(
                      (_, optionIndex) => optionIndex !== index,
                    ),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <Textarea
            rows={4}
            placeholder="Dán nhiều dòng: code, label, #hex"
            value={bulkText}
            onChange={(event) => setBulkText(event.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!bulkText.trim()}
            onClick={handleBulkPaste}
          >
            Nhập từ nội dung dán
          </Button>
        </div>
      </div>
    </Card>
  );
}

function buildValueSetUsage(
  valueSets: SpecValueSet[],
  specs: SpecDefinition[],
): Map<string, number> {
  const usage = new Map(valueSets.map((set) => [set.id, 0]));
  specs.forEach((spec) => {
    if (spec.defaultValueSetId) {
      usage.set(spec.defaultValueSetId, (usage.get(spec.defaultValueSetId) ?? 0) + 1);
    }
  });
  MATERIAL_MODELS_MOCK.forEach((model) => {
    model.specs.forEach((spec) => {
      if (spec.valueSetIdOverride) {
        usage.set(spec.valueSetIdOverride, (usage.get(spec.valueSetIdOverride) ?? 0) + 1);
      }
    });
  });
  return usage;
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
      if (values.defaultSelectionMode === 'multi') {
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
