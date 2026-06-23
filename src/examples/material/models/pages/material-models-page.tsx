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
import { MATERIAL_GROUPS_MOCK } from '../../data/material-groups.mock';
import { MATERIAL_MODELS_MOCK } from '../../data/material-models.mock';
import { MATERIALS_MOCK } from '../../data/materials.mock';
import { SPEC_DEFINITIONS_MOCK } from '../../data/spec-definitions.mock';
import type { MaterialModel } from '../../model/material-model';
import { useMaterialModelColumns } from '../components/material-model-columns.generated';
import {
  mapMaterialModelToFormValues,
  materialModelDefaultValues,
  useMaterialModelForm,
} from '../components/material-model-form.generated';
import { MaterialModelWizard } from '../components/material-model-wizard';
import type { MaterialModelFormValues } from '../material-model.schema';

let createdSeq = 0;

export function MaterialModelsPage() {
  const [models, setModels] = useState<MaterialModel[]>(MATERIAL_MODELS_MOCK);
  const [keyword, setKeyword] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialModel | null>(null);
  const [deleting, setDeleting] = useState<MaterialModel | null>(null);

  const form = useMaterialModelForm();

  useEffect(() => {
    if (!isWizardOpen) return;
    form.reset(
      editing
        ? mapMaterialModelToFormValues(editing)
        : materialModelDefaultValues,
    );
  }, [form, isWizardOpen, editing]);

  const groupNameById = useMemo(
    () => new Map(MATERIAL_GROUPS_MOCK.map((g) => [g.id, g.name])),
    [],
  );

  const groupOptions = useMemo(() => {
    const depthOf = (id: string): number => {
      const byId = new Map(MATERIAL_GROUPS_MOCK.map((g) => [g.id, g]));
      let depth = 0;
      let current = byId.get(id);
      while (current?.parentId) {
        depth += 1;
        current = byId.get(current.parentId);
      }
      return depth;
    };
    return MATERIAL_GROUPS_MOCK.filter((g) => g.isActive).map((g) => ({
      value: g.id,
      label: `${'— '.repeat(depthOf(g.id))}${g.name}`,
    }));
  }, []);

  const deviceCountByModel = useMemo(() => {
    const map = new Map<string, number>();
    for (const material of MATERIALS_MOCK) {
      map.set(material.modelId, (map.get(material.modelId) ?? 0) + 1);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return models;
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(kw) ||
        model.code.toLowerCase().includes(kw),
    );
  }, [models, keyword]);

  const handleCreate = () => {
    setEditing(null);
    setIsWizardOpen(true);
  };

  const handleEdit = (row: MaterialModel) => {
    setEditing(row);
    setIsWizardOpen(true);
  };

  const handleSubmit = (values: MaterialModelFormValues) => {
    const next: MaterialModel = {
      id: editing?.id ?? `model-new-${(createdSeq += 1)}`,
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      origin: values.origin.trim() || undefined,
      groupId: values.groupId,
      imageUrls: values.imageUrls,
      isActive: values.isActive,
      specs: values.specs.map((spec, index) => ({
        specDefinitionId: spec.specDefinitionId,
        deviceMode: spec.deviceMode,
        modelValue: spec.modelValue,
        allowedOptionIds: spec.allowedOptionIds,
        isRequired: spec.isRequired,
        sortOrder: index,
      })),
    };

    setModels((prev) =>
      editing
        ? prev.map((model) => (model.id === editing.id ? next : model))
        : [next, ...prev],
    );
    toast.success(
      editing ? `Đã cập nhật mẫu "${next.name}"` : `Đã thêm mẫu "${next.name}"`,
    );
    setIsWizardOpen(false);
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    const deviceCount = deviceCountByModel.get(deleting.id) ?? 0;
    if (deviceCount > 0) {
      toast.error('Không thể xóa: mẫu còn thiết bị thật.');
      setDeleting(null);
      return;
    }
    setModels((prev) => prev.filter((model) => model.id !== deleting.id));
    toast.success(`Đã xóa mẫu "${deleting.name}"`);
    setDeleting(null);
  };

  const columns = useMaterialModelColumns({
    groupNameById,
    deviceCountByModel,
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
        emptyMessage="Chưa có mẫu vật tư nào"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý mẫu vật tư</CardTitle>
              <CardDescription>
                Mẫu gom nhiều thiết bị cùng loại để thống kê
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
                Thêm mẫu
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

      <MaterialModelWizard
        open={isWizardOpen}
        onOpenChange={setIsWizardOpen}
        form={form}
        definitions={SPEC_DEFINITIONS_MOCK}
        groupOptions={groupOptions}
        onSubmit={handleSubmit}
        title={editing ? 'Sửa mẫu vật tư' : 'Thêm mẫu vật tư'}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa mẫu vật tư"
        description={`Bạn chắc chắn muốn xóa mẫu "${deleting?.name ?? ''}"?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
