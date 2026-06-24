import { useMemo, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink, Plus, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
import { MATERIAL_GROUPS_MOCK } from '../data/material-groups.mock';
import type { Material } from '../model/material';
import { useMaterialCatalogStore } from '../stores/material-catalog.store';

const sampleMaterialId = '601af811-5def-4bd0-b8d3-8429dece65a7';

export function MaterialsManagementPage() {
  const navigate = useNavigate();
  const { materials, materialModels, removeMaterial } =
    useMaterialCatalogStore();
  const [keyword, setKeyword] = useState('');
  const [deleting, setDeleting] = useState<Material | null>(null);

  const modelNameById = useMemo(
    () => new Map(materialModels.map((model) => [model.id, model.name])),
    [materialModels],
  );
  const groupNameById = useMemo(
    () => new Map(MATERIAL_GROUPS_MOCK.map((group) => [group.id, group.name])),
    [],
  );
  const groupNameByModelId = useMemo(
    () =>
      new Map(
        materialModels.map((model) => [
          model.id,
          groupNameById.get(model.groupId) ?? '—',
        ]),
      ),
    [groupNameById, materialModels],
  );
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

  const handleEdit = (row: Material) => {
    navigate(
      buildPath(ROUTES.EXAMPLE.MATERIAL_EDIT, {
        id: row.id,
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    removeMaterial(deleting.id);
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
              <Button asChild variant="primary">
                <Link to={ROUTES.EXAMPLE.MATERIAL_CREATE}>
                  <Plus className="size-4" />
                  Thêm thiết bị
                </Link>
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
