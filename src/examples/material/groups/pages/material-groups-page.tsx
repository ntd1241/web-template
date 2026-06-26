import { useEffect, useMemo, useState } from 'react';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog';
import { MATERIAL_GROUPS_MOCK } from '../../data/material-groups.mock';
import { MATERIAL_MODELS_MOCK } from '../../data/material-models.mock';
import type { MaterialGroup } from '../../model/material-group';
import {
  mapMaterialGroupToFormValues,
  materialGroupDefaultValues,
  MaterialGroupForm,
  useMaterialGroupForm,
} from '../components/material-group-form.generated';
import { MaterialGroupTree } from '../components/material-group-tree';
import {
  buildGroupTree,
  countDirectChildren,
  getSelfAndDescendantIds,
} from '../group-tree';
import {
  ROOT_PARENT_VALUE,
  type MaterialGroupFormValues,
} from '../material-group.schema';

let createdSeq = 0;

type PanelMode =
  | { kind: 'idle' }
  | { kind: 'edit'; id: string }
  | { kind: 'create'; parentId: string | null };

export function MaterialGroupsPage() {
  const [groups, setGroups] = useState<MaterialGroup[]>(MATERIAL_GROUPS_MOCK);
  const [mode, setMode] = useState<PanelMode>({ kind: 'idle' });
  const [deleting, setDeleting] = useState<MaterialGroup | null>(null);

  const form = useMaterialGroupForm();

  const tree = useMemo(() => buildGroupTree(groups), [groups]);

  const modelCountByGroup = useMemo(() => {
    const map = new Map<string, number>();
    for (const model of MATERIAL_MODELS_MOCK) {
      map.set(model.groupId, (map.get(model.groupId) ?? 0) + 1);
    }
    return map;
  }, []);

  const editingGroup =
    mode.kind === 'edit'
      ? (groups.find((group) => group.id === mode.id) ?? null)
      : null;
  const selectedId = mode.kind === 'edit' ? mode.id : null;

  useEffect(() => {
    if (mode.kind === 'edit' && editingGroup) {
      form.reset(mapMaterialGroupToFormValues(editingGroup));
    } else if (mode.kind === 'create') {
      form.reset({
        ...materialGroupDefaultValues,
        parentId: mode.parentId ?? ROOT_PARENT_VALUE,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /** Tùy chọn nhóm cha — loại chính nó + hậu duệ khi đang sửa (tránh vòng). */
  const parentOptions = useMemo(() => {
    const excluded =
      mode.kind === 'edit'
        ? getSelfAndDescendantIds(groups, mode.id)
        : new Set<string>();
    const labelOf = (group: MaterialGroup): string => {
      const depth = depthOf(groups, group.id);
      return `${'— '.repeat(depth)}${group.name}`;
    };
    return [
      { value: ROOT_PARENT_VALUE, label: '— Nhóm gốc —' },
      ...groups
        .filter((group) => !excluded.has(group.id))
        .map((group) => ({ value: group.id, label: labelOf(group) })),
    ];
  }, [groups, mode]);

  const handleSubmit = (values: MaterialGroupFormValues) => {
    const parentId =
      values.parentId === ROOT_PARENT_VALUE ? null : values.parentId;

    if (mode.kind === 'edit') {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === mode.id
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
      return;
    }

    const newGroup: MaterialGroup = {
      id: `grp-new-${(createdSeq += 1)}`,
      code: values.code.trim(),
      name: values.name.trim(),
      parentId,
      description: values.description.trim() || undefined,
      sortOrder: Math.max(0, ...groups.map((group) => group.sortOrder)) + 1,
    };
    setGroups((prev) => [...prev, newGroup]);
    setMode({ kind: 'edit', id: newGroup.id });
    toast.success(`Đã thêm nhóm "${values.name}"`);
  };

  const handleRequestDelete = () => {
    if (!editingGroup) return;
    const childCount = countDirectChildren(groups, editingGroup.id);
    const modelCount = modelCountByGroup.get(editingGroup.id) ?? 0;
    if (childCount > 0) {
      toast.error('Không thể xóa: nhóm còn nhóm con.');
      return;
    }
    if (modelCount > 0) {
      toast.error('Không thể xóa: nhóm còn mẫu vật tư.');
      return;
    }
    setDeleting(editingGroup);
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    setGroups((prev) => prev.filter((group) => group.id !== deleting.id));
    toast.success(`Đã xóa nhóm "${deleting.name}"`);
    setMode({ kind: 'idle' });
    setDeleting(null);
  };

  const panelTitle =
    mode.kind === 'create' ? 'Thêm nhóm vật tư' : (editingGroup?.name ?? '');

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 xl:flex-row">
      <Card className="flex min-h-0 w-full flex-col overflow-hidden xl:w-80 xl:shrink-0">
        <CardHeader className="items-center justify-between gap-2 p-4">
          <CardHeading>
            <CardTitle>Cây nhóm vật tư</CardTitle>
          </CardHeading>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setMode({ kind: 'create', parentId: null })}
          >
            <Plus className="size-4" />
            Nhóm gốc
          </Button>
        </CardHeader>
        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
          <MaterialGroupTree
            nodes={tree}
            selectedId={selectedId}
            modelCountByGroup={modelCountByGroup}
            onSelect={(id) => setMode({ kind: 'edit', id })}
            onAddChild={(parentId) => setMode({ kind: 'create', parentId })}
          />
        </ScrollArea>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {mode.kind === 'idle' ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center text-muted-foreground">
            <FolderTree className="size-10" />
            <p>Chọn một nhóm trong cây để xem chi tiết, hoặc thêm nhóm mới.</p>
          </div>
        ) : (
          <>
            <CardHeader>
              <CardHeading>
                <CardTitle>{panelTitle}</CardTitle>
              </CardHeading>
              {mode.kind === 'edit' && (
                <CardToolbar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-admin-red-primary"
                    onClick={handleRequestDelete}
                  >
                    <Trash2 />
                    Xóa nhóm
                  </Button>
                </CardToolbar>
              )}
            </CardHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <MaterialGroupForm
                form={form}
                onSubmit={handleSubmit}
                parentIdOptions={parentOptions}
              />
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMode({ kind: 'idle' })}
                >
                  Đóng
                </Button>
                <Button
                  variant="primary"
                  form="materialGroup-form"
                  type="submit"
                >
                  Lưu
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa nhóm vật tư"
        description={`Bạn chắc chắn muốn xóa nhóm "${deleting?.name ?? ''}"?`}
        onConfirm={handleConfirmDelete}
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
