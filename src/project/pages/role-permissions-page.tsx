import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  createRole,
  deleteRole,
  loadRolePermissionsWorkspace,
  replaceRolePermissions,
  updateRole,
} from '../api/role-permissions.api';
import {
  countPermissions,
  getTagSummary,
  PERMISSION_TAGS,
  type PermissionItem,
  type PermissionModule,
  type PermissionTag,
  type RoleSummary,
  type SummaryState,
} from '../model/role-permission';

const EMPTY_PERMISSION_MODULES: PermissionModule[] = [];

const tagMeta: Record<
  PermissionTag,
  {
    icon: LucideIcon;
    label: string;
    className: string;
    mutedClassName: string;
  }
> = {
  Xem: {
    icon: Eye,
    label: 'Xem',
    className:
      'border-admin-blue-border bg-secondary text-secondary-foreground',
    mutedClassName: 'text-secondary-foreground/50',
  },
  'Chỉnh sửa': {
    icon: Pencil,
    label: 'Chỉnh sửa',
    className:
      'border-admin-success-bg bg-admin-success-bg text-admin-success-text',
    mutedClassName: 'text-admin-success-text/50',
  },
  Xóa: {
    icon: Trash2,
    label: 'Xóa',
    className: 'border-admin-red-bg bg-admin-red-bg text-admin-red-primary',
    mutedClassName: 'text-admin-red-primary/50',
  },
  Duyệt: {
    icon: CheckCircle2,
    label: 'Duyệt',
    className:
      'border-admin-amber-border bg-admin-amber-bg text-admin-amber-dark',
    mutedClassName: 'text-admin-amber-dark/50',
  },
};

function flattenSelected(modules: PermissionModule[]) {
  return modules
    .flatMap((module) =>
      module.groups.flatMap((group) =>
        group.permissions.map((permission) => ({
          code: permission.code,
          selected: permission.selected,
        })),
      ),
    )
    .sort((a, b) => a.code.localeCompare(b.code));
}

function countChanges(
  modules: PermissionModule[],
  savedModules: PermissionModule[],
) {
  const current = flattenSelected(modules);
  const saved = flattenSelected(savedModules);

  return current.filter(
    (item, index) =>
      item.code !== saved[index]?.code ||
      item.selected !== saved[index]?.selected,
  ).length;
}

function countAllPermissions(modules: PermissionModule[]) {
  return modules.reduce(
    (sum, module) => sum + countPermissions(module).total,
    0,
  );
}

export function RolePermissionsPage() {
  const userId = useAuthStore((state) => state.user?.id);
  const workspaceQuery = useQuery({
    queryKey: ['project', 'role-permissions', userId],
    queryFn: () => {
      if (!userId) throw new Error('Chưa xác định tài khoản đăng nhập.');
      return loadRolePermissionsWorkspace(userId);
    },
    enabled: Boolean(userId),
  });
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>(['system']);
  const [editingRole, setEditingRole] = useState<RoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleSummary | null>(null);

  const roles = workspaceQuery.data?.roles ?? [];
  const activeRoleId = selectedRoleId || roles[0]?.id || '';
  const selectedRole = roles.find((role) => role.id === activeRoleId);
  const modulesByRoleId = workspaceQuery.data?.modulesByRoleId;
  const savedModules = useMemo(
    () =>
      activeRoleId
        ? (modulesByRoleId?.[activeRoleId] ?? EMPTY_PERMISSION_MODULES)
        : EMPTY_PERMISSION_MODULES,
    [activeRoleId, modulesByRoleId],
  );

  useEffect(() => {
    if (!activeRoleId) {
      setModules((current) =>
        current.length === 0 ? current : EMPTY_PERMISSION_MODULES,
      );
      return;
    }

    setSelectedRoleId((current) => current || activeRoleId);
    setModules(structuredClone(savedModules));
  }, [activeRoleId, savedModules]);

  const changeCount = useMemo(
    () => countChanges(modules, savedModules),
    [modules, savedModules],
  );
  const hasUnsavedChanges = changeCount > 0;
  const confirmLeave = useCallback(
    (message: string) => !hasUnsavedChanges || window.confirm(message),
    [hasUnsavedChanges],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const target = event.target as Element | null;
      const link = target?.closest('a[href]');
      if (
        !link ||
        link.getAttribute('target') === '_blank' ||
        link.hasAttribute('download') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href === window.location.pathname) {
        return;
      }

      if (!confirmLeave('Bạn có thay đổi chưa lưu. Bạn vẫn muốn rời trang?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalNavigation, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [confirmLeave, hasUnsavedChanges]);

  const totalPermissions = useMemo(
    () => countAllPermissions(modules),
    [modules],
  );
  const selectedPermissions = useMemo(
    () =>
      modules.reduce(
        (sum, module) => sum + countPermissions(module).selected,
        0,
      ),
    [modules],
  );

  const handleToggleModule = (code: string) => {
    setExpandedModules((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const handleTogglePermission = (code: string, checked: boolean) => {
    setModules((current) =>
      current.map((module) => ({
        ...module,
        groups: module.groups.map((group) => ({
          ...group,
          permissions: group.permissions.map((permission) =>
            permission.code === code
              ? { ...permission, selected: checked }
              : permission,
          ),
        })),
      })),
    );
  };

  const handleReset = () => {
    setModules(structuredClone(savedModules));
  };

  const savePermissionsMutation = useMutation({
    mutationFn: () =>
      replaceRolePermissions(
        activeRoleId,
        modules.flatMap((module) =>
          module.groups.flatMap((group) =>
            group.permissions
              .filter((permission) => permission.selected)
              .map((permission) => permission.code),
          ),
        ),
      ),
    onSuccess: async () => {
      toast.success('Đã lưu quyền cho vai trò.');
      await queryClient.invalidateQueries({
        queryKey: ['project', 'role-permissions', userId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Không thể lưu quyền.',
      ),
  });

  const saveRoleMutation = useMutation({
    mutationFn: async (role: RoleSummary) => {
      if (!workspaceQuery.data)
        throw new Error('Dữ liệu tenant chưa sẵn sàng.');

      if (role.id) {
        return updateRole(role.id, {
          name: role.name.trim(),
          description: role.description.trim() || null,
        });
      }

      const code = role.code?.trim().toLowerCase();
      if (!code) throw new Error('Vui lòng nhập mã vai trò.');
      if (!role.name.trim()) throw new Error('Vui lòng nhập tên vai trò.');

      return createRole({
        tenant_id: workspaceQuery.data.tenantId,
        code,
        name: role.name.trim(),
        description: role.description.trim() || null,
        scope: role.scope ?? 'all',
      });
    },
    onSuccess: async (role) => {
      toast.success('Đã lưu thông tin vai trò.');
      setEditingRole(null);
      if (role.id) setSelectedRoleId(role.id);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'role-permissions', userId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Không thể lưu vai trò.',
      ),
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (role: RoleSummary) => deleteRole(role.id),
    onSuccess: async () => {
      toast.success('Đã xóa vai trò.');
      setDeletingRole(null);
      setSelectedRoleId('');
      await queryClient.invalidateQueries({
        queryKey: ['project', 'role-permissions', userId],
      });
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : 'Không thể xóa vai trò.',
      ),
  });

  const handleSaveRole = () => {
    if (!editingRole) return;
    saveRoleMutation.mutate(editingRole);
  };

  if (workspaceQuery.isPending) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Đang tải cấu hình phân quyền...
      </div>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {workspaceQuery.error instanceof Error
          ? workspaceQuery.error.message
          : 'Không thể tải cấu hình phân quyền.'}
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        Chưa có vai trò nào trong tenant.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col gap-4 overflow-hidden p-4 xl:flex-row xl:p-6">
      <Card className="max-h-[220px] w-full max-w-full shrink-0 overflow-hidden xl:max-h-none xl:w-[260px]">
        <CardHeader className="min-h-0 flex-col items-start gap-1 p-4">
          <CardTitle className="text-[15px]">Vai trò</CardTitle>
        </CardHeader>
        <CardContent className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-auto p-3 xl:flex xl:flex-col">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className={cn(
                'flex w-full items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors',
                role.id === activeRoleId
                  ? 'border-primary bg-primary/8 text-foreground'
                  : 'border-border bg-background hover:bg-field',
              )}
              onClick={() => {
                if (
                  role.id === activeRoleId ||
                  confirmLeave(
                    'Bạn có thay đổi quyền chưa lưu. Bạn vẫn muốn chuyển vai trò?',
                  )
                ) {
                  setSelectedRoleId(role.id);
                }
              }}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {role.name}
                </span>
              </span>
              <Badge
                variant="secondary"
                appearance="light"
                size="sm"
                className="gap-1"
              >
                <User />
                {role.userCount}
              </Badge>
            </button>
          ))}
          <Button
            variant="outline"
            className="mt-auto justify-center"
            onClick={() =>
              setEditingRole({
                id: '',
                code: '',
                name: '',
                description: '',
                userCount: 0,
                scope: 'all',
              })
            }
          >
            + Thêm vai trò
          </Button>
        </CardContent>
      </Card>

      <Card className="min-h-0 w-full max-w-full min-w-0 flex-1 overflow-hidden">
        <CardHeader className="shrink-0 flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <CardHeading>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-[18px]">
                Phân quyền: {selectedRole.name}
              </CardTitle>
              <Badge variant="primary" appearance="light" size="sm">
                {selectedPermissions}/{totalPermissions} quyền
              </Badge>
            </div>
          </CardHeading>
          <CardToolbar>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingRole(selectedRole)}
              >
                <Pencil />
                Chỉnh sửa vai trò
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                disabled={
                  Boolean(selectedRole.isSystem) ||
                  selectedRole.userCount > 0 ||
                  deleteRoleMutation.isPending
                }
                title={
                  selectedRole.isSystem
                    ? 'Không thể xóa vai trò hệ thống'
                    : selectedRole.userCount > 0
                      ? 'Không thể xóa vai trò đang được gán cho người dùng'
                      : 'Xóa vai trò'
                }
                onClick={() => setDeletingRole(selectedRole)}
              >
                <Trash2 />
                Xóa vai trò
              </Button>
            </div>
          </CardToolbar>
        </CardHeader>

        <CardContent className="min-h-0 min-w-0 overflow-hidden p-0">
          <ScrollArea className="h-full w-full max-w-full min-w-0">
            <div className="min-w-[752px]">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(240px,1fr)_repeat(4,128px)] border-b bg-muted text-[12px] font-semibold text-secondary-foreground">
                <div className="border-r px-5 py-3">Module</div>
                {PERMISSION_TAGS.map((tag) => (
                  <div key={tag} className="border-r px-3 py-3 text-center">
                    <TagHeader tag={tag} />
                  </div>
                ))}
              </div>

              {modules.map((module) => (
                <ModulePermissionSection
                  key={module.code}
                  expanded={expandedModules.includes(module.code)}
                  module={module}
                  onToggle={() => handleToggleModule(module.code)}
                  onTogglePermission={handleTogglePermission}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        <CardFooter className="shrink-0 justify-between gap-3 bg-background">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {changeCount > 0 ? (
              <>
                <AlertTriangle className="size-4 text-admin-amber-dark" />
                <span>{changeCount} thay đổi chưa lưu</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 text-admin-success-text" />
                <span>Không có thay đổi</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={changeCount === 0}
              onClick={handleReset}
            >
              <RotateCcw />
              Khôi phục
            </Button>
            <Button
              variant="primary"
              disabled={changeCount === 0 || savePermissionsMutation.isPending}
              onClick={() => savePermissionsMutation.mutate()}
            >
              <Save />
              {savePermissionsMutation.isPending
                ? 'Đang lưu...'
                : 'Lưu thay đổi'}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <RoleEditDialog
        role={editingRole}
        onRoleChange={setEditingRole}
        onClose={() => setEditingRole(null)}
        onSave={handleSaveRole}
        isSaving={saveRoleMutation.isPending}
      />

      <RoleDeleteDialog
        role={deletingRole}
        isDeleting={deleteRoleMutation.isPending}
        onClose={() => setDeletingRole(null)}
        onConfirm={() => {
          if (deletingRole) deleteRoleMutation.mutate(deletingRole);
        }}
      />
    </div>
  );
}

interface ModulePermissionSectionProps {
  module: PermissionModule;
  expanded: boolean;
  onToggle: () => void;
  onTogglePermission: (code: string, checked: boolean) => void;
}

function ModulePermissionSection({
  expanded,
  module,
  onToggle,
  onTogglePermission,
}: ModulePermissionSectionProps) {
  return (
    <div className="border-b">
      <div className="grid grid-cols-[minmax(240px,1fr)_repeat(4,128px)] bg-background hover:bg-field">
        <div className="flex min-w-0 items-center gap-3 border-r px-5 py-3">
          <button
            type="button"
            className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background hover:bg-field"
            aria-label={expanded ? 'Thu gọn module' : 'Mở module'}
            onClick={onToggle}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </button>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-5">
              {module.name}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {module.description}
            </div>
          </div>
        </div>

        {PERMISSION_TAGS.map((tag) => (
          <div
            key={tag}
            className="flex items-center justify-center border-r px-3 py-3"
          >
            <SummaryStatus state={getTagSummary(module, tag)} tag={tag} />
          </div>
        ))}
      </div>

      {expanded && (
        <div className="bg-field/60 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {module.groups.map((group) => (
              <PermissionGroupCard
                key={group.name}
                group={group}
                onTogglePermission={onTogglePermission}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagHeader({ tag }: { tag: PermissionTag }) {
  const meta = tagMeta[tag];
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className={cn(
          'inline-flex size-5 items-center justify-center rounded-md border',
          meta.className,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span>{meta.label}</span>
    </div>
  );
}

function IconWithTooltip({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent variant="light">{label}</TooltipContent>
    </Tooltip>
  );
}

function PermissionTagIcon({ tag }: { tag: PermissionTag }) {
  const meta = tagMeta[tag];
  const Icon = meta.icon;

  return (
    <IconWithTooltip label={meta.label}>
      <span
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md border',
          meta.className,
        )}
      >
        <Icon className="size-3.5" />
      </span>
    </IconWithTooltip>
  );
}

function SensitiveIcon() {
  return (
    <IconWithTooltip label="Nhạy cảm">
      <span className="inline-flex size-6 items-center justify-center rounded-md border border-admin-amber-border bg-admin-amber-bg text-admin-amber-dark">
        <AlertTriangle className="size-3.5" />
      </span>
    </IconWithTooltip>
  );
}

function SummaryStatus({
  state,
  tag,
}: {
  state: SummaryState;
  tag: PermissionTag;
}) {
  const meta = tagMeta[tag];

  if (state === 'na') {
    return (
      <Badge variant="secondary" appearance="light" size="sm">
        N/A
      </Badge>
    );
  }

  return (
    <Checkbox
      disabled
      checked={state === 'partial' ? 'indeterminate' : state === 'all'}
      size="sm"
      className={cn(
        'disabled:cursor-default disabled:opacity-100',
        state === 'none' && 'opacity-50 disabled:opacity-50',
        state !== 'none' && meta.className,
      )}
    />
  );
}

interface PermissionGroupCardProps {
  group: PermissionModule['groups'][number];
  onTogglePermission: (code: string, checked: boolean) => void;
}

function PermissionGroupCard({
  group,
  onTogglePermission,
}: PermissionGroupCardProps) {
  const selectedCount = group.permissions.filter(
    (permission) => permission.selected,
  ).length;
  const hasSensitive = group.permissions.some(
    (permission) => permission.sensitive,
  );

  return (
    <div className="rounded-md border bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <div className="font-semibold">{group.name}</div>
          <div className="text-xs text-muted-foreground">
            {selectedCount}/{group.permissions.length} quyền đang bật
          </div>
        </div>
        {hasSensitive && <SensitiveIcon />}
      </div>
      <div className="divide-y">
        {group.permissions.map((permission) => (
          <PermissionRow
            key={permission.code}
            permission={permission}
            onTogglePermission={onTogglePermission}
          />
        ))}
      </div>
    </div>
  );
}

interface PermissionRowProps {
  permission: PermissionItem;
  onTogglePermission: (code: string, checked: boolean) => void;
}

function PermissionRow({ permission, onTogglePermission }: PermissionRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 hover:bg-field">
      <div className="min-w-0">
        <span className="text-sm font-medium">{permission.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {permission.tags.map((tag) => (
          <PermissionTagIcon key={tag} tag={tag} />
        ))}
        {permission.sensitive && <SensitiveIcon />}
        <Checkbox
          checked={permission.selected}
          onCheckedChange={(checked) =>
            onTogglePermission(permission.code, checked === true)
          }
        />
      </div>
    </label>
  );
}

interface RoleEditDialogProps {
  role: RoleSummary | null;
  onRoleChange: (role: RoleSummary | null) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
}

function RoleEditDialog({
  role,
  onRoleChange,
  onClose,
  onSave,
  isSaving,
}: RoleEditDialogProps) {
  const isCreating = Boolean(role && !role.id);

  return (
    <Dialog open={!!role} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Thêm vai trò' : 'Chỉnh sửa vai trò'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Tạo vai trò mới cho tenant hiện tại.'
              : 'Cập nhật tên và mô tả hiển thị của vai trò.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {isCreating && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mã vai trò *</label>
              <Input
                value={role?.code ?? ''}
                placeholder="ví dụ: warehouse_manager"
                onChange={(event) =>
                  role &&
                  onRoleChange({ ...role, code: event.currentTarget.value })
                }
              />
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tên vai trò *</label>
            <Input
              value={role?.name ?? ''}
              onChange={(event) =>
                role &&
                onRoleChange({ ...role, name: event.currentTarget.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              value={role?.description ?? ''}
              onChange={(event) =>
                role &&
                onRoleChange({
                  ...role,
                  description: event.currentTarget.value,
                })
              }
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RoleDeleteDialogProps {
  role: RoleSummary | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function RoleDeleteDialog({
  role,
  isDeleting,
  onClose,
  onConfirm,
}: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={!!role} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa vai trò?</AlertDialogTitle>
          <AlertDialogDescription>
            Vai trò <strong>{role?.name}</strong> và các quyền được gán cho vai
            trò này sẽ bị xóa. Hành động không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa vai trò'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
