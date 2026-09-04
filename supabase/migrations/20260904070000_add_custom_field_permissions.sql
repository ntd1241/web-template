-- Add dedicated permissions for tenant custom-field configuration.

insert into public.permission_groups (
  module_code, code, name, description, sort_order, is_active
)
values (
  'organization',
  'custom-fields',
  'Cấu hình dữ liệu',
  'Quản lý các trường bổ sung theo từng đối tượng của tenant',
  15,
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
  is_active,
  tags,
  group_id
)
select
  permission.code,
  'organization',
  'Cấu hình dữ liệu',
  permission.name,
  permission.action,
  permission.sensitive,
  permission.sort_order,
  true,
  permission.tags,
  permission_group.id
from (
  values
    ('organization:custom-field:view'::text, 'Xem cấu hình dữ liệu'::text, 'view'::text, false, 25, array['Xem']::text[]),
    ('organization:custom-field:create'::text, 'Thêm trường bổ sung'::text, 'create'::text, false, 26, array['Chỉnh sửa']::text[]),
    ('organization:custom-field:update'::text, 'Chỉnh sửa trường bổ sung'::text, 'update'::text, false, 27, array['Chỉnh sửa']::text[]),
    ('organization:custom-field:delete'::text, 'Xóa trường bổ sung'::text, 'delete'::text, true, 28, array['Xóa']::text[])
) as permission(code, name, action, sensitive, sort_order, tags)
join public.permission_groups permission_group
  on permission_group.module_code = 'organization'
 and permission_group.code = 'custom-fields'
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  is_active = true,
  tags = excluded.tags,
  group_id = excluded.group_id;

-- Existing tenant administrators receive the new configuration permissions.
insert into public.role_permissions (role_id, permission_code)
select role_record.id, permission.code
from public.roles role_record
cross join (
  values
    ('organization:custom-field:view'::text),
    ('organization:custom-field:create'::text),
    ('organization:custom-field:update'::text),
    ('organization:custom-field:delete'::text)
) as permission(code)
where role_record.code = 'admin'
on conflict do nothing;

-- Replace the temporary tenant-level policies with dedicated permission checks.
drop policy if exists "Members with tenant view can view custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with tenant update can create custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with tenant update can update custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with tenant update can delete custom field definitions"
  on public.tenant_custom_field_definitions;
drop policy if exists "Members with tenant view can view custom field options"
  on public.tenant_custom_field_options;
drop policy if exists "Members with tenant update can manage custom field options"
  on public.tenant_custom_field_options;

create policy "Members with custom field view can view definitions"
on public.tenant_custom_field_definitions
for select to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:custom-field:view')
);

create policy "Members with custom field create can create definitions"
on public.tenant_custom_field_definitions
for insert to authenticated
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:create'));

create policy "Members with custom field update can update definitions"
on public.tenant_custom_field_definitions
for update to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'));

create policy "Members with custom field delete can delete definitions"
on public.tenant_custom_field_definitions
for delete to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:delete'));

create policy "Members with custom field view can view options"
on public.tenant_custom_field_options
for select to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.is_tenant_member(definition.tenant_id)
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:view')
  )
);

create policy "Members with custom field update can manage options"
on public.tenant_custom_field_options
for all to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
)
with check (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
);
