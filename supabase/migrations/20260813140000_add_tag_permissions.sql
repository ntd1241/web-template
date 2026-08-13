-- Quyền cho module Nhãn. Catalog quyền là dữ liệu dùng chung cho mọi tenant.
insert into public.permission_modules (code, name, description, sort_order, is_active)
values (
  'organization',
  'Tổ chức',
  'Quản lý thông tin tổ chức, thành viên và phân quyền trong tenant',
  10,
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
  'organization',
  'tags',
  'Nhãn',
  'Quản lý nhóm nhãn, nhãn và dữ liệu phân loại dùng chung',
  30,
  true
)
on conflict (module_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_definitions (
  code,
  module_code,
  group_name,
  name,
  action,
  sensitive,
  sort_order,
  is_active
)
values
  (
    'organization:tag:view',
    'organization',
    'Nhãn',
    'Xem danh sách nhãn',
    'view',
    false,
    80,
    true
  ),
  (
    'organization:tag:create',
    'organization',
    'Nhãn',
    'Thêm nhóm nhãn và nhãn',
    'create',
    false,
    90,
    true
  ),
  (
    'organization:tag:update',
    'organization',
    'Nhãn',
    'Chỉnh sửa nhóm nhãn và nhãn',
    'update',
    false,
    100,
    true
  ),
  (
    'organization:tag:delete',
    'organization',
    'Nhãn',
    'Xóa nhóm nhãn và nhãn',
    'delete',
    true,
    110,
    true
  )
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  is_active = true;

update public.permission_definitions definition
set
  group_id = permission_group.id,
  tags = case definition.action
    when 'view' then array['Xem']::text[]
    when 'delete' then array['Xóa']::text[]
    else array['Chỉnh sửa']::text[]
  end
from public.permission_groups permission_group
where definition.module_code = 'organization'
  and definition.group_name = 'Nhãn'
  and permission_group.module_code = 'organization'
  and permission_group.code = 'tags';

-- Admin mặc định nhận toàn bộ quyền catalog hiện hành.
insert into public.role_permissions (role_id, permission_code)
select role_record.id, definition.code
from public.roles role_record
cross join public.permission_definitions definition
where role_record.code = 'admin'
  and definition.module_code = 'organization'
  and definition.group_name = 'Nhãn'
  and definition.is_active
on conflict do nothing;

-- Quản lý được quản lý nhãn; nhân viên chỉ được xem nhãn khi cần hiển thị.
insert into public.role_permissions (role_id, permission_code)
select role_record.id, selected.permission_code
from public.roles role_record
cross join unnest(array[
  'organization:tag:view',
  'organization:tag:create',
  'organization:tag:update'
]::text[]) as selected(permission_code)
where role_record.code = 'manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, 'organization:tag:view'
from public.roles role_record
where role_record.code = 'employee'
on conflict do nothing;

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
    'system:audit-log:view', 'organization:tag:view', 'organization:tag:create',
    'organization:tag:update'
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
    'organization:tag:view'
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

-- Backend enforcement: catalog quyền là security boundary, không chỉ là UI metadata.
drop policy if exists "Members can view tag groups" on public.tag_groups;
drop policy if exists "Tenant admins can manage tag groups" on public.tag_groups;
drop policy if exists "Members can view tags" on public.tags;
drop policy if exists "Tenant admins can manage tags" on public.tags;
drop policy if exists "Members can view tag assignments" on public.tag_assignments;

create policy "Members with tag view can view tag groups"
on public.tag_groups
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:tag:view')
  and is_active
);

create policy "Members with tag create can create tag groups"
on public.tag_groups
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'organization:tag:create')
);

create policy "Members with tag update can update tag groups"
on public.tag_groups
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:tag:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:tag:update'));

create policy "Members with tag delete can delete tag groups"
on public.tag_groups
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:tag:delete'));

create policy "Members with tag view can view tags"
on public.tags
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:tag:view')
  and is_active
);

create policy "Members with tag create can create tags"
on public.tags
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'organization:tag:create')
);

create policy "Members with tag update can update tags"
on public.tags
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:tag:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:tag:update'));

create policy "Members with tag delete can delete tags"
on public.tags
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:tag:delete'));

create policy "Members with tag view can view tag assignments"
on public.tag_assignments
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:tag:view')
);
