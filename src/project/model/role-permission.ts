export const PERMISSION_TAGS = ['Xem', 'Chỉnh sửa', 'Xóa', 'Duyệt'] as const;

export type PermissionTag = (typeof PERMISSION_TAGS)[number];
export type SummaryState = 'all' | 'partial' | 'none' | 'na';
export const PERMISSION_SCOPES = ['self', 'department', 'all'] as const;
export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export interface RoleSummary {
  id: string;
  code?: string;
  name: string;
  description: string;
  userCount: number;
  scope?: PermissionScope;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface PermissionItem {
  code: string;
  name: string;
  description?: string;
  selected: boolean;
  tags: PermissionTag[];
  sensitive?: boolean;
}

export interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

export interface PermissionModule {
  code: string;
  name: string;
  description: string;
  groups: PermissionGroup[];
}

export interface PermissionDefinitionRow {
  code: string;
  module_code: string;
  group_name: string;
  group_id: string;
  name: string;
  action: string;
  tags: PermissionTag[];
  sensitive: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface PermissionModuleRow {
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface PermissionGroupRow {
  id: string;
  module_code: string;
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
}

export interface RoleRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  scope: PermissionScope;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermissionRow {
  role_id: string;
  permission_code: string;
}

export interface TenantMemberRoleRow {
  tenant_id: string;
  user_id: string;
  role_id: string;
}

export function applySelectedPermissionCodes(
  modules: PermissionModule[],
  selectedCodes: ReadonlySet<string>,
): PermissionModule[] {
  return modules.map((module) => ({
    ...module,
    groups: module.groups.map((group) => ({
      ...group,
      permissions: group.permissions.map((permission) => ({
        ...permission,
        selected: selectedCodes.has(permission.code),
      })),
    })),
  }));
}

export function getModulePermissions(module: PermissionModule) {
  return module.groups.flatMap((group) => group.permissions);
}

export function getTagSummary(
  module: PermissionModule,
  tag: PermissionTag,
): SummaryState {
  const taggedPermissions = getModulePermissions(module).filter((permission) =>
    permission.tags.includes(tag),
  );

  if (taggedPermissions.length === 0) return 'na';

  const selectedCount = taggedPermissions.filter(
    (permission) => permission.selected,
  ).length;

  if (selectedCount === taggedPermissions.length) return 'all';
  if (selectedCount > 0) return 'partial';
  return 'none';
}

export function countPermissions(module: PermissionModule) {
  const permissions = getModulePermissions(module);
  const selected = permissions.filter((permission) => permission.selected);
  const sensitive = permissions.filter((permission) => permission.sensitive);

  return {
    selected: selected.length,
    total: permissions.length,
    sensitiveSelected: selected.filter((permission) => permission.sensitive)
      .length,
    sensitiveTotal: sensitive.length,
  };
}
