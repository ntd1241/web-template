-- Nhãn là năng lực dùng chung của hệ thống, không thuộc riêng module Tổ chức.
-- Di chuyển catalog và toàn bộ liên kết role/user override sang system:tag:*.

insert into public.permission_modules (
  code, name, description, sort_order, is_active
)
values (
  'system',
  'Hệ thống',
  'Cài đặt hệ thống, vai trò, phân quyền và các danh mục dùng chung',
  20,
  true
)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_groups (
  module_code, code, name, description, sort_order, is_active
)
values (
  'system',
  'tags',
  'Nhãn',
  'Quản lý các nhãn dùng chung cho nhiều đối tượng trong hệ thống',
  30,
  true
)
on conflict (module_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

-- Tạo mã mới từ catalog hiện tại, giữ nguyên tên, action và metadata.
insert into public.permission_definitions (
  code,
  module_code,
  group_name,
  name,
  action,
  sensitive,
  sort_order,
  is_active,
  tags,
  group_id
)
select
  replace(definition.code, 'organization:tag:', 'system:tag:'),
  'system',
  definition.group_name,
  definition.name,
  definition.action,
  definition.sensitive,
  definition.sort_order,
  definition.is_active,
  definition.tags,
  permission_group.id
from public.permission_definitions definition
join public.permission_groups permission_group
  on permission_group.module_code = 'system'
 and permission_group.code = 'tags'
where definition.code like 'organization:tag:%'
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  tags = excluded.tags,
  group_id = excluded.group_id;

insert into public.role_permissions (role_id, permission_code, created_at)
select
  role_permission.role_id,
  replace(role_permission.permission_code, 'organization:tag:', 'system:tag:'),
  role_permission.created_at
from public.role_permissions role_permission
where role_permission.permission_code like 'organization:tag:%'
on conflict do nothing;

insert into public.user_permission_overrides (
  tenant_id,
  user_id,
  permission_code,
  effect,
  created_at,
  updated_at
)
select
  permission_override.tenant_id,
  permission_override.user_id,
  replace(permission_override.permission_code, 'organization:tag:', 'system:tag:'),
  permission_override.effect,
  permission_override.created_at,
  permission_override.updated_at
from public.user_permission_overrides permission_override
where permission_override.permission_code like 'organization:tag:%'
on conflict do nothing;

delete from public.role_permissions
where permission_code like 'organization:tag:%';

delete from public.user_permission_overrides
where permission_code like 'organization:tag:%';

delete from public.permission_definitions
where code like 'organization:tag:%';

delete from public.permission_groups
where module_code = 'organization'
  and code = 'tags';

-- Giữ mặc định cho các tenant/role được khởi tạo về sau đồng bộ với catalog mới.
create or replace function public.ensure_tenant_permission_defaults(target_tenant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_tenant_role(
    target_tenant_id,
    array['owner', 'admin']::public.tenant_member_role[]
  ) then
    raise exception 'Tenant administrator required' using errcode = '42501';
  end if;

  insert into public.roles (tenant_id, code, name, description, scope, is_system)
  values
    (target_tenant_id, 'admin', 'Admin', 'Toàn quyền vận hành hệ thống', 'all', true),
    (target_tenant_id, 'manager', 'Quản lý', 'Quản lý nghiệp vụ và duyệt thao tác quan trọng', 'all', false),
    (target_tenant_id, 'employee', 'Nhân viên', 'Thao tác nghiệp vụ hằng ngày', 'self', false),
    (target_tenant_id, 'accountant', 'Kế toán', 'Theo dõi đơn hàng, báo cáo và công nợ', 'department', false)
  on conflict (tenant_id, code) do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, definition.code
  from public.roles role_record
  cross join public.permission_definitions definition
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'admin'
    and definition.is_active
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'employees:account:view', 'employees:account:edit', 'employees:account:lock',
    'employees:profile:view', 'employees:profile:edit', 'orders:view', 'orders:edit',
    'orders:approve', 'orders:cancel', 'orders:shipping-status', 'warehouse:stock:view',
    'warehouse:import:edit', 'warehouse:export:edit', 'reports:revenue:view',
    'reports:inventory:view', 'system:roles:view', 'system:settings:view',
    'system:audit-log:view', 'system:tag:view', 'system:tag:create',
    'system:tag:update'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'manager'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'employees:account:view', 'employees:profile:view', 'orders:view',
    'warehouse:stock:view', 'reports:revenue:view', 'reports:inventory:view',
    'system:tag:view'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'employee'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'orders:view', 'orders:approve', 'reports:revenue:view', 'reports:inventory:view',
    'reports:debt:view', 'warehouse:stock:view', 'system:roles:view'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'accountant'
  on conflict do nothing;

  insert into public.tenant_member_roles (tenant_id, user_id, role_id)
  select target_tenant_id, auth.uid(), role_record.id
  from public.roles role_record
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'admin'
  on conflict do nothing;
end;
$$;

-- Đổi security boundary của các bảng nhãn sang permission code mới.
drop policy if exists "Members with tag view can view tag groups" on public.tag_groups;
drop policy if exists "Members with tag create can create tag groups" on public.tag_groups;
drop policy if exists "Members with tag update can update tag groups" on public.tag_groups;
drop policy if exists "Members with tag delete can delete tag groups" on public.tag_groups;
drop policy if exists "Members with tag view can view tags" on public.tags;
drop policy if exists "Members with tag create can create tags" on public.tags;
drop policy if exists "Members with tag update can update tags" on public.tags;
drop policy if exists "Members with tag delete can delete tags" on public.tags;
drop policy if exists "Members with tag view can view tag assignments" on public.tag_assignments;

create policy "Members with tag view can view tag groups"
on public.tag_groups
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'system:tag:view')
  and is_active
);

create policy "Members with tag create can create tag groups"
on public.tag_groups
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'system:tag:create')
);

create policy "Members with tag update can update tag groups"
on public.tag_groups
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:tag:update'))
with check (public.has_tenant_permission(tenant_id, 'system:tag:update'));

create policy "Members with tag delete can delete tag groups"
on public.tag_groups
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:tag:delete'));

create policy "Members with tag view can view tags"
on public.tags
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'system:tag:view')
  and is_active
);

create policy "Members with tag create can create tags"
on public.tags
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'system:tag:create')
);

create policy "Members with tag update can update tags"
on public.tags
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:tag:update'))
with check (public.has_tenant_permission(tenant_id, 'system:tag:update'));

create policy "Members with tag delete can delete tags"
on public.tags
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:tag:delete'));

create policy "Members with tag view can view tag assignments"
on public.tag_assignments
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'system:tag:view')
);
