create table public.permission_modules (
  code text primary key,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint permission_modules_code_not_blank check (length(btrim(code)) > 0),
  constraint permission_modules_name_not_blank check (length(btrim(name)) > 0)
);

create table public.permission_groups (
  id uuid primary key default gen_random_uuid(),
  module_code text not null references public.permission_modules(code) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint permission_groups_module_code_unique unique (module_code, code),
  constraint permission_groups_code_not_blank check (length(btrim(code)) > 0),
  constraint permission_groups_name_not_blank check (length(btrim(name)) > 0)
);

alter table public.permission_definitions
  add column group_id uuid,
  add column tags text[] not null default '{}'::text[];

create index permission_groups_module_code_idx on public.permission_groups(module_code);
create index permission_definitions_group_id_idx on public.permission_definitions(group_id);

create trigger permission_modules_set_updated_at
before update on public.permission_modules
for each row execute function public.set_updated_at();

create trigger permission_groups_set_updated_at
before update on public.permission_groups
for each row execute function public.set_updated_at();

insert into public.permission_modules (code, name, description, sort_order)
values
  ('employees', 'Nhân viên', 'Quản lý hồ sơ nhân sự, tài khoản và thông tin nội bộ', 10),
  ('orders', 'Đơn hàng', 'Bán hàng, trạng thái giao hàng, hoàn tiền và chiết khấu', 20),
  ('warehouse', 'Kho', 'Nhập xuất, kiểm kê, điều chỉnh tồn và chốt phiếu kho', 30),
  ('reports', 'Báo cáo', 'Xem và xuất file theo đúng phạm vi dữ liệu được cấp', 40),
  ('system', 'Hệ thống', 'Cài đặt hệ thống, vai trò, phân quyền và nhật ký bảo mật', 50)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_groups (module_code, code, name, description, sort_order)
values
  ('employees', 'account', 'Tài khoản', '', 10),
  ('employees', 'profile', 'Hồ sơ nhân viên', '', 20),
  ('orders', 'operations', 'Vận hành đơn', '', 10),
  ('orders', 'pricing', 'Giá & chiết khấu', '', 20),
  ('warehouse', 'vouchers', 'Phiếu kho', '', 10),
  ('warehouse', 'inventory', 'Kiểm kê', '', 20),
  ('reports', 'types', 'Loại báo cáo', '', 10),
  ('reports', 'sensitive', 'Dữ liệu nhạy cảm', '', 20),
  ('system', 'roles', 'Vai trò & phân quyền', '', 10),
  ('system', 'settings', 'Cài đặt hệ thống', '', 20)
on conflict (module_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

update public.permission_definitions definition
set group_id = permission_group.id
from public.permission_groups permission_group
where permission_group.module_code = definition.module_code
  and permission_group.name = definition.group_name;

update public.permission_definitions
set tags = case
  when code in ('employees:account:view', 'employees:profile:view', 'employees:compensation:view',
                'orders:view', 'reports:revenue:view', 'reports:inventory:view', 'reports:debt:view',
                'reports:gross-profit:view', 'reports:raw-data:view', 'system:roles:view',
                'system:settings:view', 'system:audit-log:view', 'warehouse:stock:view')
    then array['Xem']::text[]
  when code in ('employees:account:edit', 'employees:account:lock', 'employees:account:reset-password',
                'employees:profile:edit', 'orders:edit', 'orders:shipping-status',
                'orders:price:edit-after-confirm', 'warehouse:import:edit', 'warehouse:export:edit',
                'warehouse:inventory:adjust', 'system:roles:edit', 'system:roles:copy',
                'system:settings:edit')
    then array['Chỉnh sửa']::text[]
  when code in ('employees:account:delete', 'system:roles:delete')
    then array['Xóa']::text[]
  when code in ('orders:approve', 'orders:refund', 'orders:discount:override',
                'warehouse:voucher:approve', 'warehouse:inventory:close')
    then array['Duyệt']::text[]
  when code in ('orders:cancel')
    then array['Xóa', 'Duyệt']::text[]
  when code in ('system:roles:permissions-edit', 'system:security-config:edit')
    then array['Chỉnh sửa', 'Duyệt']::text[]
  else array[]::text[]
end;

alter table public.permission_definitions
  alter column group_id set not null;

alter table public.permission_definitions
  add constraint permission_definitions_group_id_fkey
  foreign key (group_id) references public.permission_groups(id) on delete restrict;

grant select on public.permission_modules to authenticated;
grant select on public.permission_groups to authenticated;

alter table public.permission_modules enable row level security;
alter table public.permission_groups enable row level security;

create policy "Authenticated users can view active permission modules"
on public.permission_modules
for select
to authenticated
using (is_active);

create policy "Authenticated users can view active permission groups"
on public.permission_groups
for select
to authenticated
using (is_active);
