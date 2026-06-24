import { useMemo, useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus, Search } from 'lucide-react';
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
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog';
import { MATERIAL_GROUPS_MOCK } from '../../data/material-groups.mock';
import type { MaterialModel } from '../../model/material-model';
import { useMaterialCatalogStore } from '../../stores/material-catalog.store';
import { useMaterialModelColumns } from '../components/material-model-columns.generated';

export function MaterialModelsPage() {
  const navigate = useNavigate();
  const {
    materials,
    materialModels: models,
    removeMaterialModel,
  } = useMaterialCatalogStore();
  const [keyword, setKeyword] = useState('');
  const [deleting, setDeleting] = useState<MaterialModel | null>(null);

  const groupNameById = useMemo(
    () => new Map(MATERIAL_GROUPS_MOCK.map((g) => [g.id, g.name])),
    [],
  );

  const deviceCountByModel = useMemo(() => {
    const map = new Map<string, number>();
    for (const material of materials) {
      map.set(material.modelId, (map.get(material.modelId) ?? 0) + 1);
    }
    return map;
  }, [materials]);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return models;
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(kw) ||
        model.code.toLowerCase().includes(kw),
    );
  }, [models, keyword]);

  const handleEdit = (row: MaterialModel) => {
    navigate(
      buildPath(ROUTES.EXAMPLE.MATERIAL_MODEL_EDIT, {
        id: row.id,
      }),
    );
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    const deviceCount = deviceCountByModel.get(deleting.id) ?? 0;
    if (deviceCount > 0) {
      toast.error('Không thể xóa: mẫu còn thiết bị thật.');
      setDeleting(null);
      return;
    }
    removeMaterialModel(deleting.id);
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
              <Button asChild variant="primary">
                <Link to={ROUTES.EXAMPLE.MATERIAL_MODEL_CREATE}>
                  <Plus className="size-4" />
                  Thêm mẫu
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
        title="Xóa mẫu vật tư"
        description={`Bạn chắc chắn muốn xóa mẫu "${deleting?.name ?? ''}"?`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
