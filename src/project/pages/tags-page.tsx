import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FolderPlus, Plus, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  emptyTagForm,
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

export function TagsPage() {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: ['project', 'tags', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadTagWorkspace(userId);
    },
    enabled: Boolean(userId),
  });
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TagGroup | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
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
          isGroup: true,
          isExpanded,
        }),
      }),
    [collapsedGroupIds, groups, tags],
  );

  const invalidateWorkspace = () =>
    queryClient.invalidateQueries({ queryKey: ['project', 'tags', userId] });

  const groupForm = useTagGroupForm();
  const tagForm = useTagForm();

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
    mutationFn: async (values: TagFormValues) => {
      if (!workspace || !userId) throw new Error('Chưa xác định tenant.');
      if (editingTag) return updateTag(editingTag.id, values);
      return createTag(workspace.tenantId, userId, values);
    },
    onSuccess: async () => {
      toast.success(editingTag ? 'Đã cập nhật nhãn.' : 'Đã tạo nhãn.');
      setTagDialogOpen(false);
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
        const group = groups.find((item) => item.id === row.id);
        if (group) openEditGroup(group);
        return;
      }

      setEditingTag(row);
      tagForm.reset({
        groupId: row.groupId,
        name: row.name,
        description: row.description,
        code: row.code,
        color: row.color ?? '#2563eb',
      });
      setTagDialogOpen(true);
    },
    onToggleGroup: (groupId) => {
      setCollapsedGroupIds((current) => toggleTagGroup(current, groupId));
    },
    onDelete: (row) => {
      if (row.isGroup) {
        if (row.assignmentCount > 0) {
          toast.error('Hãy xóa các nhãn con trước khi xóa nhóm.');
          return;
        }
        if (window.confirm(`Bạn có chắc muốn xóa nhóm "${row.name}"?`)) {
          deleteGroupMutation.mutate(row.id);
        }
        return;
      }

      if (window.confirm(`Bạn có chắc muốn xóa nhãn "${row.name}"?`)) {
        deleteTagMutation.mutate(row.id);
      }
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
    setEditingGroup(group);
    groupForm.reset({
      name: group.name,
      code: group.code,
      description: group.description,
    });
    setGroupDialogOpen(true);
  }

  function openCreateTag(groupId = groups[0]?.id ?? '') {
    setEditingTag(null);
    tagForm.reset({ ...emptyTagForm, groupId });
    setTagDialogOpen(true);
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
                    size="sm"
                    onClick={openCreateGroup}
                  >
                    <FolderPlus className="size-4" />
                    Thêm nhóm
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm nhóm nhãn</TooltipContent>
              </Tooltip>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={groups.length === 0}
                onClick={openCreateTag}
              >
                <Plus className="size-4" />
                Thêm nhãn
              </Button>
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
        title={editingGroup ? 'Sửa nhóm nhãn' : 'Thêm nhóm nhãn'}
      />
      <TagFormDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
        form={tagForm}
        onSubmit={(values) => tagMutation.mutate(values)}
        title={editingTag ? 'Sửa nhãn' : 'Thêm nhãn'}
        groupIdOptions={groups.map((group) => ({
          value: group.id,
          label: group.name,
        }))}
      />
    </div>
  );
}
