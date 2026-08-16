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
    ),
    (
      new.id,
      'contracts',
      'Nhóm hợp đồng',
      'Nhóm hệ thống dành cho các nhãn phân loại hợp đồng.',
      'contracts',
      true,
      7
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
  'contracts',
  'Nhóm hợp đồng',
  'Nhóm hệ thống dành cho các nhãn phân loại hợp đồng.',
  'contracts',
  true,
  7
from public.tenants tenant
on conflict (tenant_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  module_code = excluded.module_code,
  is_system = true,
  sort_order = excluded.sort_order,
  is_active = true;
