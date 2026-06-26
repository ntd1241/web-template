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
  CardContent,
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
import { MaterialGroupTree } from '../../groups/components/material-group-tree';
import { buildGroupTree } from '../../groups/group-tree';
import { filterModelsByGroup } from '../../lib/filter-models-by-group';
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
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
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

  const tree = useMemo(() => buildGroupTree(MATERIAL_GROUPS_MOCK), []);

  const modelCountByGroup = useMemo(() => {
    const map = new Map<string, number>();
    for (const model of models) {
      map.set(model.groupId, (map.get(model.groupId) ?? 0) + 1);
    }
    return map;
  }, [models]);

  const filtered = useMemo(() => {
    const byGroup = filterModelsByGroup(
      models,
      MATERIAL_GROUPS_MOCK,
      selectedGroupId,
    );
    const kw = keyword.trim().toLowerCase();
    if (!kw) return byGroup;
    return byGroup.filter(
      (model) =>
        model.name.toLowerCase().includes(kw) ||
        model.code.toLowerCase().includes(kw),
    );
  }, [models, keyword, selectedGroupId]);

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
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 xl:flex-row">
      <Card className="flex min-h-0 w-full flex-col overflow-hidden xl:w-80 xl:shrink-0">
        <CardHeader className="p-4">
          <CardHeading>
            <CardTitle>Cây nhóm vật tư</CardTitle>
            <CardDescription>Lọc mẫu theo nhóm và nhóm con</CardDescription>
          </CardHeading>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 px-2 pb-3">
          <button
            type="button"
            className="mb-2 flex w-full items-center justify-between rounded-admin-control px-3 py-2 text-start text-sm text-foreground hover:bg-admin-surface-alt"
            onClick={() => setSelectedGroupId(null)}
          >
            <span>Tất cả</span>
            <span className="rounded-full bg-admin-surface-alt px-2 py-0.5 text-xs text-muted-foreground">
              {models.length}
            </span>
          </button>
          <ScrollArea className="h-[calc(100%-2.75rem)]">
            <MaterialGroupTree
              nodes={tree}
              selectedId={selectedGroupId}
              modelCountByGroup={modelCountByGroup}
              onSelect={setSelectedGroupId}
              onAddChild={() => {}}
            />
          </ScrollArea>
        </CardContent>
      </Card>

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
