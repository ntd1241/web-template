import { useEffect, useMemo, useState } from 'react';
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
import {
  mapMaterialGroupToFormValues,
  materialGroupDefaultValues,
  MaterialGroupFormDialog,
  useMaterialGroupForm,
} from '../../groups/components/material-group-form.generated';
import { MaterialGroupTreePanel } from '../../groups/components/material-group-tree';
import { GeneratedMaterialGroupTreePanel } from '../../groups/components/material-group-tree.generated';
import {
  buildGroupTree,
  countDirectChildren,
  countModelsByGroup,
  getSelfAndDescendantIds,
} from '../../groups/group-tree';
import {
  ROOT_PARENT_VALUE,
  type MaterialGroupFormValues,
} from '../../groups/material-group.schema';
import { filterModelsByGroup } from '../../lib/filter-models-by-group';
import type { MaterialGroup } from '../../model/material-group';
import type { MaterialModel } from '../../model/material-model';
import { useMaterialCatalogStore } from '../../stores/material-catalog.store';
import { useMaterialModelColumns } from '../components/material-model-columns.generated';

let createdGroupSeq = 0;

type GroupDialogState =
  | { kind: 'create'; parentId: string | null }
  | { kind: 'edit'; id: string }
  | null;

export function MaterialModelsPage() {
  const navigate = useNavigate();
  const {
    materials,
    materialModels: models,
    removeMaterialModel,
  } = useMaterialCatalogStore();
  const [groups, setGroups] = useState<MaterialGroup[]>(MATERIAL_GROUPS_MOCK);
  const [keyword, setKeyword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<MaterialModel | null>(null);
  const [groupDialog, setGroupDialog] = useState<GroupDialogState>(null);
  const [deletingGroup, setDeletingGroup] = useState<MaterialGroup | null>(
    null,
  );
  const groupForm = useMaterialGroupForm();

  const groupNameById = useMemo(
    () => new Map(groups.map((group) => [group.id, group.name])),
    [groups],
  );

  const deviceCountByModel = useMemo(() => {
    const map = new Map<string, number>();
    for (const material of materials) {
      map.set(material.modelId, (map.get(material.modelId) ?? 0) + 1);
    }
    return map;
  }, [materials]);

  const tree = useMemo(() => buildGroupTree(groups), [groups]);

  const modelCountByGroup = useMemo(() => {
    return countModelsByGroup(models, groups);
  }, [groups, models]);

  const editingGroup =
    groupDialog?.kind === 'edit'
      ? (groups.find((group) => group.id === groupDialog.id) ?? null)
      : null;

  const parentOptions = useMemo(() => {
    const excluded =
      groupDialog?.kind === 'edit'
        ? getSelfAndDescendantIds(groups, groupDialog.id)
        : new Set<string>();
    return [
      { value: ROOT_PARENT_VALUE, label: '— Nhóm gốc —' },
      ...groups
        .filter((group) => !excluded.has(group.id))
        .map((group) => ({
          value: group.id,
          label: `${'— '.repeat(depthOf(groups, group.id))}${group.name}`,
        })),
    ];
  }, [groupDialog, groups]);

  useEffect(() => {
    if (groupDialog?.kind === 'edit' && editingGroup) {
      groupForm.reset(mapMaterialGroupToFormValues(editingGroup));
    } else if (groupDialog?.kind === 'create') {
      groupForm.reset({
        ...materialGroupDefaultValues,
        parentId: groupDialog.parentId ?? ROOT_PARENT_VALUE,
      });
    }
  }, [editingGroup, groupDialog, groupForm]);

  const filtered = useMemo(() => {
    const byGroup = filterModelsByGroup(models, groups, selectedGroupId);
    const kw = keyword.trim().toLowerCase();
    if (!kw) return byGroup;
    return byGroup.filter(
      (model) =>
        model.name.toLowerCase().includes(kw) ||
        model.code.toLowerCase().includes(kw),
    );
  }, [groups, models, keyword, selectedGroupId]);

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

  const handleGroupSubmit = (values: MaterialGroupFormValues) => {
    const parentId =
      values.parentId === ROOT_PARENT_VALUE ? null : values.parentId;

    if (groupDialog?.kind === 'edit') {
      setGroups((previous) =>
        previous.map((group) =>
          group.id === groupDialog.id
            ? {
                ...group,
                code: values.code.trim(),
                name: values.name.trim(),
                parentId,
                description: values.description.trim() || undefined,
              }
            : group,
        ),
      );
      toast.success(`Đã cập nhật nhóm "${values.name}"`);
    } else {
      const newGroup: MaterialGroup = {
        id: `grp-new-${(createdGroupSeq += 1)}`,
        code: values.code.trim(),
        name: values.name.trim(),
        parentId,
        description: values.description.trim() || undefined,
        sortOrder: Math.max(0, ...groups.map((group) => group.sortOrder)) + 1,
      };
      setGroups((previous) => [...previous, newGroup]);
      toast.success(`Đã thêm nhóm "${values.name}"`);
    }
    setGroupDialog(null);
  };

  const handleRequestGroupDelete = (group: MaterialGroup) => {
    if (countDirectChildren(groups, group.id) > 0) {
      toast.error('Không thể xóa: nhóm còn nhóm con.');
      return;
    }
    if ((modelCountByGroup.get(group.id) ?? 0) > 0) {
      toast.error('Không thể xóa: nhóm còn mẫu vật tư.');
      return;
    }
    setDeletingGroup(group);
  };

  const handleConfirmGroupDelete = () => {
    if (!deletingGroup) return;
    setGroups((previous) =>
      previous.filter((group) => group.id !== deletingGroup.id),
    );
    if (selectedGroupId === deletingGroup.id) {
      setSelectedGroupId(null);
    }
    toast.success(`Đã xóa nhóm "${deletingGroup.name}"`);
    setDeletingGroup(null);
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
      <div className="flex min-h-0 w-full flex-col gap-4 md:flex-row xl:w-[42rem] xl:shrink-0">
        <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <CardHeader className="p-4">
            <CardHeading>
              <CardTitle>Cây nhóm vật tư</CardTitle>
              <CardDescription>Lọc mẫu theo nhóm và nhóm con</CardDescription>
            </CardHeading>
          </CardHeader>
          <MaterialGroupTreePanel
            className="min-h-0 flex-1"
            nodes={tree}
            selectedId={selectedGroupId}
            modelCountByGroup={modelCountByGroup}
            onSelect={setSelectedGroupId}
            onAddChild={(parentId) =>
              setGroupDialog({ kind: 'create', parentId })
            }
            onEdit={(node) => setGroupDialog({ kind: 'edit', id: node.id })}
            onDelete={handleRequestGroupDelete}
            allCount={models.length}
            isAllSelected={selectedGroupId === null}
            onSelectAll={() => setSelectedGroupId(null)}
          />
        </Card>

        <Card className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <CardHeader className="p-4">
            <CardHeading>
              <CardTitle>Cây nhóm vật tư (generated)</CardTitle>
              <CardDescription>
                Bản sinh từ tree builder để đối chiếu
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <GeneratedMaterialGroupTreePanel
            className="min-h-0 flex-1"
            nodes={tree}
            selectedId={selectedGroupId}
            countByNode={modelCountByGroup}
            onSelect={setSelectedGroupId}
            onAdd={(parentId) => setGroupDialog({ kind: 'create', parentId })}
            onEdit={(node) => setGroupDialog({ kind: 'edit', id: node.id })}
            onDelete={handleRequestGroupDelete}
            allCount={models.length}
            isAllSelected={selectedGroupId === null}
            onSelectAll={() => setSelectedGroupId(null)}
          />
        </Card>
      </div>

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

      <MaterialGroupFormDialog
        open={groupDialog !== null}
        onOpenChange={(open) => !open && setGroupDialog(null)}
        form={groupForm}
        onSubmit={handleGroupSubmit}
        title={
          groupDialog?.kind === 'create'
            ? 'Thêm nhóm vật tư'
            : (editingGroup?.name ?? 'Sửa nhóm vật tư')
        }
        parentIdOptions={parentOptions}
      />

      <ConfirmDeleteDialog
        open={deletingGroup !== null}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        title="Xóa nhóm vật tư"
        description={`Bạn chắc chắn muốn xóa nhóm "${deletingGroup?.name ?? ''}"?`}
        onConfirm={handleConfirmGroupDelete}
      />
    </div>
  );
}

function depthOf(groups: MaterialGroup[], id: string): number {
  const byId = new Map(groups.map((group) => [group.id, group]));
  let depth = 0;
  let current = byId.get(id);
  while (current?.parentId) {
    depth += 1;
    current = byId.get(current.parentId);
  }
  return depth;
}
