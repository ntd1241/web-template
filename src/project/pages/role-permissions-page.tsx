import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
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
import { PageLoading } from '@/components/ui/loading';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { RoleFormDialog, useRoleForm } from '../forms/role-form.generated';
import {
  countPermissions,
  getTagSummary,
  PERMISSION_TAGS,
  ROLE_COLOR_SWATCH_CLASSES,
  type PermissionItem,
  type PermissionModule,
  type PermissionTag,
  type RoleFormValues,
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
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const workspaceQuery = useQuery({
    queryKey: ['project', 'role-permissions', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadRolePermissionsWorkspace(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
  });
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<string[]>(['system']);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRole, setDialogRole] = useState<RoleSummary | null>(null);
  const [deletingRole, setDeletingRole] = useState<RoleSummary | null>(null);
  const roleForm = useRoleForm();

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

  const openRoleDialog = (role: RoleSummary) => {
    setDialogRole(role);
    roleForm.reset({
      code: role.code ?? '',
      name: role.name,
      color: role.color,
      description: role.description,
    });
    setDialogOpen(true);
  };

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
    mutationFn: async ({
      role,
      values,
    }: {
      role: RoleSummary;
      values: RoleFormValues;
    }) => {
      if (!workspaceQuery.data)
        throw new Error('Dữ liệu tenant chưa sẵn sàng.');

      if (role.id) {
        return updateRole(role.id, {
          name: values.name.trim(),
          description: values.description.trim() || null,
          color: values.color,
        });
      }

      const code = values.code.trim().toLowerCase();
      if (!code) throw new Error('Vui lòng nhập mã vai trò.');

      return createRole({
        tenant_id: workspaceQuery.data.tenantId,
        code,
        name: values.name.trim(),
        color: values.color,
        description: values.description.trim() || null,
        scope: role.scope ?? 'all',
      });
    },
    onSuccess: async (role) => {
      toast.success('Đã lưu thông tin vai trò.');
      setDialogOpen(false);
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

  const handleSaveRole = (values: RoleFormValues) => {
    if (!dialogRole) return;
    saveRoleMutation.mutate({ role: dialogRole, values });
  };

  if (workspaceQuery.isPending) {
    return (
      <PageLoading label="Đang tải cấu hình phân quyền..." className="h-full" />
    );
  }

  if (workspaceQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-destructive lg:p-5">
        {workspaceQuery.error instanceof Error
          ? workspaceQuery.error.message
          : 'Không thể tải cấu hình phân quyền.'}
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground lg:p-5">
        Chưa có vai trò nào trong tenant.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full max-w-full min-w-0 flex-col gap-4 overflow-y-auto p-4 xl:flex-row xl:overflow-hidden xl:p-5">
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
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2.5 shrink-0 rounded-full border',
                    ROLE_COLOR_SWATCH_CLASSES[role.color],
                  )}
                />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    {role.name}
                  </span>
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
              openRoleDialog({
                id: '',
                code: '',
                name: '',
                color: 'blue',
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
                onClick={() => openRoleDialog(selectedRole)}
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
              disabled={changeCount === 0}
              loading={savePermissionsMutation.isPending}
              loadingText="Đang lưu..."
              onClick={() => savePermissionsMutation.mutate()}
            >
              <Save />
              Lưu thay đổi
            </Button>
          </div>
        </CardFooter>
      </Card>

      <RoleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        form={roleForm}
        onSubmit={handleSaveRole}
        title={dialogRole?.id ? 'Chỉnh sửa vai trò' : 'Thêm vai trò'}
        isCreating={!dialogRole?.id}
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
            loading={isDeleting}
            loadingText="Đang xóa..."
            onClick={onConfirm}
          >
            Xóa vai trò
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
