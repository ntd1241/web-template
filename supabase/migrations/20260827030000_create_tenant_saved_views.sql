-- Tenant-shared saved views for reusable list filters and table layouts.
create table public.tenant_saved_views (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  resource text not null,
  name text not null,
  config jsonb not null default '{}'::jsonb,
  is_default boolean not null default false,
  version integer not null default 1,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_saved_views_resource_check check (
    resource in ('customers', 'employees', 'contracts', 'contract_templates')
  ),
  constraint tenant_saved_views_name_not_blank check (length(btrim(name)) > 0),
  constraint tenant_saved_views_version_positive check (version > 0)
);

create unique index tenant_saved_views_name_unique_idx
on public.tenant_saved_views (tenant_id, resource, lower(name));

create unique index tenant_saved_views_default_unique_idx
on public.tenant_saved_views (tenant_id, resource)
where is_default;

create index tenant_saved_views_tenant_resource_idx
on public.tenant_saved_views (tenant_id, resource, created_at);

create trigger tenant_saved_views_set_updated_at
before update on public.tenant_saved_views
for each row execute function public.set_updated_at();

insert into public.permission_groups (
  module_code, code, name, description, sort_order, is_active
)
values (
  'system',
  'views',
  'Chế độ xem',
  'Quản lý các chế độ xem dùng chung trong tenant',
  40,
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
  tags,
  group_id
)
select
  'system:views:manage',
  'system',
  'Chế độ xem',
  'Quản lý chế độ xem dùng chung',
  'update',
  false,
  490,
  array['Chỉnh sửa', 'Xóa']::text[],
  permission_group.id
from public.permission_groups permission_group
where permission_group.module_code = 'system'
  and permission_group.code = 'views'
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

-- Existing tenant administrators should receive the newly introduced catalog permission.
insert into public.role_permissions (role_id, permission_code)
select role_record.id, 'system:views:manage'
from public.roles role_record
where role_record.code = 'admin'
on conflict do nothing;

grant select, insert, update, delete on public.tenant_saved_views to authenticated;

alter table public.tenant_saved_views enable row level security;

create policy "Tenant members can view saved views"
on public.tenant_saved_views
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "Members with saved view permission can create saved views"
on public.tenant_saved_views
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'system:views:manage')
  and created_by = auth.uid()
  and updated_by = auth.uid()
);

create policy "Members with saved view permission can update saved views"
on public.tenant_saved_views
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:views:manage'))
with check (
  public.has_tenant_permission(tenant_id, 'system:views:manage')
  and updated_by = auth.uid()
);

create policy "Members with saved view permission can delete saved views"
on public.tenant_saved_views
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'system:views:manage'));
