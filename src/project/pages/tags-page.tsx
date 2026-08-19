import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FolderPlus, Plus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  createTag,
  createTagGroup,
  deleteTag,
  deleteTagGroup,
  loadTagWorkspace,
  updateTag,
  updateTagGroup,
} from '../tags/api/tags.api';
import { TagFormDialog, useTagForm } from '../tags/forms/tag-form.generated';
import {
  TagGroupFormDialog,
  useTagGroupForm,
} from '../tags/forms/tag-group-form.generated';
import {
  emptyTagGroupForm,
  type Tag,
  type TagFormValues,
  type TagGroup,
  type TagGroupFormValues,
} from '../tags/model/tag';
import {
  buildTagGroupedRows,
  toggleTagGroup,
  useTagColumns,
} from '../tags/table/tag.columns.generated';

const EMPTY_GROUPS: TagGroup[] = [];
const EMPTY_TAGS: Tag[] = [];

type PendingDelete = {
  kind: 'group' | 'tag';
  id: string;
  name: string;
};

export function TagsPage() {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: ['project', 'tags', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadTagWorkspace(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
  });
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [tagCreateDialogOpen, setTagCreateDialogOpen] = useState(false);
  const [tagEditDialogOpen, setTagEditDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
    null,
  );
  const [collapsedGroupIds, setCollapsedGroupIds] = useState<Set<string>>(
    new Set(),
  );

  const workspace = workspaceQuery.data;
  const groups = workspace?.groups ?? EMPTY_GROUPS;
  const tags = workspace?.tags ?? EMPTY_TAGS;
  const tableRows = useMemo(
    () =>
      buildTagGroupedRows(groups, tags, collapsedGroupIds, {
        getGroupId: (group) => group.id,
        toGroupRow: (group, isExpanded) => ({
          id: group.id,
          tenantId: group.tenantId,
          groupId: group.id,
          code: group.code,
          name: group.name,
          sortOrder: group.sortOrder,
          isActive: group.isActive,
          groupName: '',
          assignmentCount: group.tagCount,
          description: '',
          groupDescription: group.description,
          moduleCode: group.moduleCode,
          isSystem: group.isSystem,
          isGroup: true,
          isExpanded,
        }),
      }),
    [collapsedGroupIds, groups, tags],
  );

  const invalidateWorkspace = () =>
    queryClient.invalidateQueries({ queryKey: ['project', 'tags', userId] });

  const groupForm = useTagGroupForm();
  const tagCreateForm = useTagForm();
  const tagEditForm = useTagForm();

  const groupMutation = useMutation({
    mutationFn: async (values: TagGroupFormValues) => {
      if (!workspace || !userId) throw new Error('Chưa xác định tenant.');
      if (editingGroup) {
        return updateTagGroup(editingGroup.id, values);
      }
      return createTagGroup(workspace.tenantId, userId, values);
    },
    onSuccess: async () => {
      toast.success(
        editingGroup ? 'Đã cập nhật nhóm nhãn.' : 'Đã tạo nhóm nhãn.',
      );
      setGroupDialogOpen(false);
      await invalidateWorkspace();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const tagMutation = useMutation({
    mutationFn: async ({
      values,
      tag,
    }: {
      values: TagFormValues;
      tag: Tag | null;
    }) => {
      if (!workspace || !userId) throw new Error('Chưa xác định tenant.');
      if (tag) return updateTag(tag.id, values);
      return createTag(workspace.tenantId, userId, values);
    },
    onSuccess: async (_, variables) => {
      toast.success(variables.tag ? 'Đã cập nhật nhãn.' : 'Đã tạo nhãn.');
      if (variables.tag) {
        setTagEditDialogOpen(false);
      } else {
        setTagCreateDialogOpen(false);
      }
      await invalidateWorkspace();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: deleteTagGroup,
    onSuccess: async () => {
      toast.success('Đã xóa nhóm nhãn.');
      await invalidateWorkspace();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: async () => {
      toast.success('Đã xóa nhãn.');
      await invalidateWorkspace();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const columns = useTagColumns({
    onAddTag: (row) => openCreateTag(row.id),
    onEdit: (row) => {
      if (row.isGroup) {
        if (row.isSystem) {
          toast.error('Không thể sửa hoặc xóa nhóm nhãn hệ thống.');
          return;
        }
        const group = groups.find((item) => item.id === row.id);
        if (group) openEditGroup(group);
        return;
      }

      openEditTag(row);
    },
    onToggleGroup: (groupId) => {
      setCollapsedGroupIds((current) => toggleTagGroup(current, groupId));
    },
    onDelete: (row) => {
      if (row.isGroup) {
        if (row.isSystem) {
          toast.error('Không thể sửa hoặc xóa nhóm nhãn hệ thống.');
          return;
        }
        if (row.assignmentCount > 0) {
          toast.error('Hãy xóa các nhãn con trước khi xóa nhóm.');
          return;
        }
        setPendingDelete({ kind: 'group', id: row.id, name: row.name });
        return;
      }

      setPendingDelete({ kind: 'tag', id: row.id, name: row.name });
    },
  });
  const table = useReactTable({
    data: tableRows,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  if (workspaceQuery.isError) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được hệ thống nhãn</CardTitle>
            <CardDescription className="mt-1">
              {getApiErrorMessage(workspaceQuery.error)}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => workspaceQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  function openCreateGroup() {
    setEditingGroup(null);
    groupForm.reset(emptyTagGroupForm);
    setGroupDialogOpen(true);
  }

  function openEditGroup(group: TagGroup) {
    if (group.isSystem) {
      toast.error('Không thể sửa hoặc xóa nhóm nhãn hệ thống.');
      return;
    }
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      code: group.code,
      description: group.description,
    });
    setGroupDialogOpen(true);
  }

  function openCreateTag(groupId?: string) {
    if (groupId && !tagCreateForm.getValues('groupId')) {
      tagCreateForm.setValue('groupId', groupId);
    }
    setTagCreateDialogOpen(true);
  }

  function openEditTag(tag: Tag) {
    setEditingTag(tag);
    tagEditForm.reset({
      groupId: tag.groupId,
      name: tag.name,
      description: tag.description,
      code: tag.code,
      color: tag.color ?? '#2563eb',
    });
    setTagEditDialogOpen(true);
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={tableRows.length}
        isLoading={workspaceQuery.isLoading}
        emptyMessage="Chưa có nhóm nhãn hoặc nhãn"
        isRowClickable={(row) => Boolean(row.isGroup)}
        getRowClassName={(row) => (row.isGroup ? undefined : '[&>td]:!py-2')}
        onRowClick={(row) => {
          if (row.isGroup) {
            setCollapsedGroupIds((current) => {
              return toggleTagGroup(current, row.id);
            });
          }
        }}
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="justify-between">
            <CardTitle>Quản lý nhãn</CardTitle>
            <CardToolbar>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openCreateGroup}
                  >
                    <FolderPlus className="size-4" />
                    Thêm nhóm
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm nhóm nhãn</TooltipContent>
              </Tooltip>
              <ShortcutTooltip label="Thêm nhãn" shortcut="Alt + N">
                <Button
                  type="button"
                  variant="primary"
                  disabled={groups.length === 0}
                  onClick={openCreateTag}
                  data-shortcut-action="create"
                >
                  <Plus className="size-4" />
                  Thêm nhãn
                </Button>
              </ShortcutTooltip>
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

      <TagGroupFormDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        form={groupForm}
        onSubmit={(values) => groupMutation.mutate(values)}
        isSaving={groupMutation.isPending}
        title={editingGroup ? 'Sửa nhóm nhãn' : 'Thêm nhóm nhãn'}
      />
      <TagFormDialog
        open={tagCreateDialogOpen}
        onOpenChange={setTagCreateDialogOpen}
        mode="create"
        form={tagCreateForm}
        onSubmit={(values) => tagMutation.mutate({ values, tag: null })}
        isSaving={tagMutation.isPending}
        title="Thêm nhãn"
        groupIdOptions={groups.map((group) => ({
          value: group.id,
          label: group.name,
        }))}
      />
      <TagFormDialog
        open={tagEditDialogOpen}
        onOpenChange={setTagEditDialogOpen}
        mode="edit"
        form={tagEditForm}
        onSubmit={(values) => {
          if (editingTag) {
            tagMutation.mutate({ values, tag: editingTag });
          }
        }}
        isSaving={tagMutation.isPending}
        title="Sửa nhãn"
        groupIdOptions={groups.map((group) => ({
          value: group.id,
          label: group.name,
        }))}
      />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={pendingDelete?.kind === 'group' ? 'Xóa nhóm nhãn?' : 'Xóa nhãn?'}
        description={
          pendingDelete
            ? `Bạn có chắc muốn xóa ${
                pendingDelete.kind === 'group' ? 'nhóm nhãn' : 'nhãn'
              } "${pendingDelete.name}"?`
            : ''
        }
        confirmLabel={
          pendingDelete?.kind === 'group' ? 'Xóa nhóm nhãn' : 'Xóa nhãn'
        }
        confirmVariant="destructive"
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.kind === 'group') {
            deleteGroupMutation.mutate(pendingDelete.id);
          } else {
            deleteTagMutation.mutate(pendingDelete.id);
          }
        }}
      />
    </div>
  );
}
