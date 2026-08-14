do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'customer_status'
  ) then
    create type public.customer_status as enum ('active', 'inactive');
  end if;
  if not exists (
    select 1 from pg_type where typname = 'customer_type'
  ) then
    create type public.customer_type as enum ('individual', 'organization');
  end if;
end;
$$;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_code text not null,
  name text not null,
  customer_type public.customer_type not null default 'individual',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  status public.customer_status not null default 'active',
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint customers_tenant_code_unique unique (tenant_id, customer_code),
  constraint customers_code_not_blank check (length(btrim(customer_code)) > 0),
  constraint customers_name_not_blank check (length(btrim(name)) > 0),
  constraint customers_email_format check (
    email = '' or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  )
);

create index customers_tenant_status_idx
  on public.customers(tenant_id, status);
create index customers_tenant_name_idx
  on public.customers(tenant_id, name);

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.customers to authenticated;

insert into public.permission_modules (code, name, description, sort_order, is_active)
values (
  'customers',
  'Khách hàng',
  'Quản lý thông tin, trạng thái và phân loại khách hàng',
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
  'customers',
  'customers',
  'Khách hàng',
  'Danh sách và thông tin khách hàng',
  10,
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
  group_id,
  name,
  action,
  sensitive,
  sort_order,
  tags,
  is_active
)
select
  seed.code,
  'customers',
  'Khách hàng',
  permission_group.id,
  seed.name,
  seed.action,
  seed.sensitive,
  seed.sort_order,
  seed.tags,
  true
from public.permission_groups permission_group
cross join (
  values
    ('customers:view', 'Xem danh sách khách hàng', 'view', false, 10, array['Xem']::text[]),
    ('customers:create', 'Thêm khách hàng', 'create', false, 20, array['Chỉnh sửa']::text[]),
    ('customers:update', 'Chỉnh sửa khách hàng', 'update', false, 30, array['Chỉnh sửa']::text[]),
    ('customers:delete', 'Xóa khách hàng', 'delete', true, 40, array['Xóa']::text[]),
    ('customers:assign-tag', 'Gán nhãn cho khách hàng', 'assign', false, 50, array['Chỉnh sửa', 'Duyệt']::text[])
) as seed(code, name, action, sensitive, sort_order, tags)
where permission_group.module_code = 'customers'
  and permission_group.code = 'customers'
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  group_id = excluded.group_id,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  tags = excluded.tags,
  is_active = true;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, definition.code
from public.roles role_record
cross join public.permission_definitions definition
where role_record.code = 'admin'
  and definition.module_code = 'customers'
  and definition.is_active
on conflict do nothing;

create or replace function public.seed_system_tag_groups_for_tenant()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.tag_groups (
    tenant_id, code, name, description, module_code, is_system, sort_order
  )
  values
    (
      new.id,
      'employees',
      'Nhóm nhân viên',
      'Nhóm hệ thống dành cho các nhãn phân loại nhân viên.',
      'organization',
      true,
      5
    ),
    (
      new.id,
      'customers',
      'Nhóm khách hàng',
      'Nhóm hệ thống dành cho các nhãn phân loại khách hàng.',
      'customers',
      true,
      6
    )
  on conflict (tenant_id, code) do nothing;

  return new;
end;
$$;

insert into public.tag_groups (
  tenant_id, code, name, description, module_code, is_system, sort_order
)
select
  tenant.id,
  'customers',
  'Nhóm khách hàng',
  'Nhóm hệ thống dành cho các nhãn phân loại khách hàng.',
  'customers',
  true,
  6
from public.tenants tenant
on conflict (tenant_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  module_code = excluded.module_code,
  is_system = true,
  sort_order = excluded.sort_order,
  is_active = true;
