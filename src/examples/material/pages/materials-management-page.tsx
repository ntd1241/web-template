import { useEffect, useMemo, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
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
import { ConfirmDeleteDialog } from '../components/confirm-delete-dialog';
import { useMaterialColumns } from '../components/material-columns.generated';
import {
  mapMaterialToFormValues,
  materialDefaultValues,
  MaterialFormDialog,
  useMaterialForm,
} from '../components/material-form.generated';
import { MATERIAL_GROUPS_MOCK } from '../data/material-groups.mock';
import { MATERIAL_MODELS_MOCK } from '../data/material-models.mock';
import { MATERIALS_MOCK } from '../data/materials.mock';
import { SPEC_DEFINITIONS_MOCK } from '../data/spec-definitions.mock';
import {
  buildMaterialSpecValues,
  legacyGroupFromModelGroupId,
  validateMaterialSpecValues,
} from '../lib/material-device';
import type { Material } from '../model/material';
import type { MaterialFormValues } from '../material.schema';

const sampleMaterialId = '601af811-5def-4bd0-b8d3-8429dece65a7';
let createdSeq = 0;

export function MaterialsManagementPage() {
  const [materials, setMaterials] = useState<Material[]>(MATERIALS_MOCK);
  const [keyword, setKeyword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);

  const form = useMaterialForm();
  const watchedModelId = form.watch('modelId');

  const activeModels = useMemo(
    () => MATERIAL_MODELS_MOCK.filter((model) => model.isActive),
    [],
  );
  const modelById = useMemo(
    () => new Map(MATERIAL_MODELS_MOCK.map((model) => [model.id, model])),
    [],
  );
  const modelNameById = useMemo(
    () => new Map(MATERIAL_MODELS_MOCK.map((model) => [model.id, model.name])),
    [],
  );
  const groupNameById = useMemo(
    () => new Map(MATERIAL_GROUPS_MOCK.map((group) => [group.id, group.name])),
    [],
  );
  const groupNameByModelId = useMemo(
    () =>
      new Map(
        MATERIAL_MODELS_MOCK.map((model) => [
          model.id,
          groupNameById.get(model.groupId) ?? '—',
        ]),
      ),
    [groupNameById],
  );
  const modelIdOptions = useMemo(
    () =>
      activeModels.map((model) => ({
        value: model.id,
        label: model.name,
      })),
    [activeModels],
  );
  const selectedModel = watchedModelId
    ? modelById.get(watchedModelId)
    : undefined;

  useEffect(() => {
    if (!isDialogOpen) return;
    form.reset(editing ? mapMaterialToFormValues(editing) : materialDefaultValues);
  }, [form, isDialogOpen, editing]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return materials;

    return materials.filter((material) => {
      const modelName = modelNameById.get(material.modelId) ?? '';
      const groupName = groupNameByModelId.get(material.modelId) ?? '';
      return (
        material.name.toLowerCase().includes(kw) ||
        material.code.toLowerCase().includes(kw) ||
        modelName.toLowerCase().includes(kw) ||
        groupName.toLowerCase().includes(kw)
      );
    });
  }, [groupNameByModelId, keyword, materials, modelNameById]);

  const handleCreate = () => {
    setEditing(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (row: Material) => {
    setEditing(row);
    setIsDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditing(null);
  };

  const handleSubmit = (values: MaterialFormValues) => {
    const model = modelById.get(values.modelId);
    if (!model) {
      toast.error('Chọn mẫu hợp lệ trước khi lưu');
      return;
    }

    const missingSpecs = validateMaterialSpecValues(
      model,
      values.specValues,
      SPEC_DEFINITIONS_MOCK,
    );
    if (missingSpecs.length > 0) {
      toast.error(`Nhập thông số bắt buộc: ${missingSpecs.join(', ')}`);
      return;
    }

    const next: Material = {
      id: editing?.id ?? `material-new-${(createdSeq += 1)}`,
      name: values.name.trim(),
      code: values.code.trim(),
      imageUrl: editing?.imageUrl ?? model.imageUrls[0] ?? '',
      group: legacyGroupFromModelGroupId(model.groupId),
      modelId: model.id,
      specValues: buildMaterialSpecValues(
        model,
        values.specValues,
        SPEC_DEFINITIONS_MOCK,
      ),
      tags: editing?.tags ?? [],
    };

    setMaterials((prev) =>
      editing
        ? prev.map((material) => (material.id === editing.id ? next : material))
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
    setMaterials((prev) =>
      prev.filter((material) => material.id !== deleting.id),
    );
    toast.success(`Đã xóa "${deleting.name}"`);
    setDeleting(null);
  };

  const columns = useMaterialColumns({
    modelNameById,
    groupNameByModelId,
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

  const publicUrl = buildPath(ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL, {
    id: sampleMaterialId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={filtered.length}
        emptyMessage="Chưa có vật tư nào"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý vật tư</CardTitle>
              <CardDescription>
                Danh sách vật tư / thiết bị gắn mã QR
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm tên / mã / mẫu"
                  variant="md"
                  className="w-60 pl-8"
                />
              </div>
              <Button asChild variant="outline">
                <Link to={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Mở trang public
                </Link>
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                <Plus className="size-4" />
                Thêm thiết bị
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

      <MaterialFormDialog
        open={isDialogOpen}
        onOpenChange={handleDialogOpenChange}
        form={form}
        onSubmit={handleSubmit}
        title={editing ? 'Sửa thiết bị' : 'Thêm thiết bị'}
        modelIdOptions={modelIdOptions}
        selectedModel={selectedModel}
        definitions={SPEC_DEFINITIONS_MOCK}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa thiết bị"
        description={`Bạn chắc chắn muốn xóa "${deleting?.name ?? ''}"? Hành động không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
