alter table public.tag_groups
  add column module_code text references public.permission_modules(code) on delete restrict,
  add column is_system boolean not null default false;

alter table public.tag_groups
  add constraint tag_groups_system_module_check check (
    (is_system and module_code is not null)
    or (not is_system and module_code is null)
  );

create index tag_groups_module_idx
  on public.tag_groups(tenant_id, module_code, is_active, sort_order, name);

create or replace function public.seed_system_tag_groups_for_tenant()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.tag_groups (
    tenant_id,
    code,
    name,
    description,
    module_code,
    is_system,
    sort_order
  )
  values (
    new.id,
    'employees',
    'Nhóm nhân viên',
    'Nhóm hệ thống dành cho các nhãn phân loại nhân viên.',
    'organization',
    true,
    5
  )
  on conflict (tenant_id, code) do nothing;

  return new;
end;
$$;

drop trigger if exists tenants_seed_system_tag_groups on public.tenants;
create trigger tenants_seed_system_tag_groups
after insert on public.tenants
for each row execute function public.seed_system_tag_groups_for_tenant();

-- The current product catalog represents employee management in the organization module.
-- Provision one protected employee-label group for every existing tenant.
insert into public.tag_groups (
  tenant_id,
  code,
  name,
  description,
  module_code,
  is_system,
  sort_order
)
select
  tenant.id,
  'employees',
  'Nhóm nhân viên',
  'Nhóm hệ thống dành cho các nhãn phân loại nhân viên.',
  'organization',
  true,
  5
from public.tenants tenant
on conflict (tenant_id, code) do nothing;
