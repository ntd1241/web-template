import { useMemo, useState, type ReactNode } from 'react';
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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
  clonePermissionModules,
  countPermissions,
  getTagSummary,
  INITIAL_PERMISSION_MODULES,
  PERMISSION_TAGS,
  ROLE_SUMMARIES,
  type PermissionItem,
  type PermissionModule,
  type PermissionTag,
  type RoleSummary,
  type SummaryState,
} from '../model/role-permission';

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

function countPermissionChanges(modules: PermissionModule[]) {
  const current = flattenSelected(modules);
  const initial = flattenSelected(INITIAL_PERMISSION_MODULES);

  return current.filter(
    (item, index) => item.selected !== initial[index]?.selected,
  ).length;
}

function countAllPermissions(modules: PermissionModule[]) {
  return modules.reduce(
    (sum, module) => sum + countPermissions(module).total,
    0,
  );
}

export function RolePermissionsPage() {
  const [roles, setRoles] = useState<RoleSummary[]>(ROLE_SUMMARIES);
  const [selectedRoleId, setSelectedRoleId] = useState('manager');
  const [modules, setModules] = useState(() => clonePermissionModules());
  const [expandedModules, setExpandedModules] = useState<string[]>(['system']);
  const [editingRole, setEditingRole] = useState<RoleSummary | null>(null);

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const changeCount = useMemo(() => countPermissionChanges(modules), [modules]);
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
    setModules(clonePermissionModules());
  };

  const handleSaveRole = () => {
    if (!editingRole) return;
    setRoles((current) =>
      current.map((role) =>
        role.id === editingRole.id ? { ...role, ...editingRole } : role,
      ),
    );
    setEditingRole(null);
  };

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
                role.id === selectedRoleId
                  ? 'border-primary bg-primary/8 text-foreground'
                  : 'border-border bg-background hover:bg-field',
              )}
              onClick={() => setSelectedRoleId(role.id)}
            >
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold">
                  {role.name}
                </span>
              </span>
              <Badge variant="secondary" appearance="light" size="sm">
                {role.userCount}
              </Badge>
            </button>
          ))}
          <Button variant="outline" className="mt-auto justify-center">
            + Thêm vai trò
          </Button>
        </CardContent>
      </Card>

      <Card className="min-h-0 w-full max-w-full min-w-0 flex-1 overflow-hidden">
        <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <CardHeading>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-[18px]">
                Phân quyền: {selectedRole.name}
              </CardTitle>
              <Badge variant="primary" appearance="light" size="sm">
                {selectedPermissions}/{totalPermissions} quyền
              </Badge>
            </div>
            <CardDescription>
              {selectedRole.description}. Cột Xem bao gồm xuất file theo phạm vi
              dữ liệu được phép xem.
            </CardDescription>
          </CardHeading>
          <CardToolbar className="justify-end">
            <Button
              variant="outline"
              onClick={() => setEditingRole(selectedRole)}
            >
              <Pencil />
              Chỉnh sửa vai trò
            </Button>
          </CardToolbar>
        </CardHeader>

        <CardContent className="min-h-0 min-w-0 overflow-hidden p-0">
          <ScrollArea className="h-full w-full max-w-full min-w-0">
            <div className="min-w-[860px]">
              <div className="sticky top-0 z-10 grid grid-cols-[minmax(240px,1fr)_repeat(4,104px)_86px_82px] border-b bg-muted text-[12px] font-semibold text-secondary-foreground">
                <div className="border-r px-5 py-3">Module</div>
                {PERMISSION_TAGS.map((tag) => (
                  <div key={tag} className="border-r px-3 py-3 text-center">
                    <TagHeader tag={tag} />
                  </div>
                ))}
                <div className="border-r px-3 py-3 text-center">Đã chọn</div>
                <div className="px-3 py-3 text-center">Action</div>
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

        <CardFooter className="justify-between gap-3 bg-background">
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
            <Button variant="primary" disabled={changeCount === 0}>
              <Save />
              Lưu thay đổi
            </Button>
          </div>
        </CardFooter>
      </Card>

      <RoleEditDialog
        role={editingRole}
        onRoleChange={setEditingRole}
        onClose={() => setEditingRole(null)}
        onSave={handleSaveRole}
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
  const counts = countPermissions(module);

  return (
    <div className="border-b">
      <div className="grid grid-cols-[minmax(240px,1fr)_repeat(4,104px)_86px_82px] bg-background hover:bg-field">
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

        <div className="flex items-center justify-center border-r px-3 py-3 text-sm font-semibold tabular-nums">
          {counts.selected}/{counts.total}
        </div>
        <div className="flex items-center justify-center px-3 py-3">
          <Button variant="outline" size="sm" onClick={onToggle}>
            {expanded ? 'Đóng' : 'Mở'}
          </Button>
        </div>
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{permission.name}</span>
        </div>
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
}

function RoleEditDialog({
  role,
  onRoleChange,
  onClose,
  onSave,
}: RoleEditDialogProps) {
  return (
    <Dialog open={!!role} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
          <DialogDescription>
            Cập nhật tên và mô tả hiển thị của vai trò.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
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
          <Button variant="primary" onClick={onSave}>
            Lưu thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
