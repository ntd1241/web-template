create type public.employee_status as enum ('active', 'inactive');

create table public.employees (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  employee_code text not null,
  first_name text not null,
  last_name text not null default '',
  job_title text not null default '',
  department text not null default '',
  phone text not null default '',
  status public.employee_status not null default 'active',
  joined_at date,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint employees_tenant_code_unique unique (tenant_id, employee_code),
  constraint employees_tenant_user_unique unique (tenant_id, user_id),
  constraint employees_code_not_blank check (length(btrim(employee_code)) > 0),
  constraint employees_first_name_not_blank check (length(btrim(first_name)) > 0)
);

create index employees_tenant_status_idx on public.employees(tenant_id, status);
create index employees_user_id_idx on public.employees(user_id);

create trigger employees_set_updated_at
before update on public.employees
for each row execute function public.set_updated_at();

-- Thành viên hiện tại được xem là nhân viên đã liên kết tài khoản.
insert into public.employees (
  tenant_id,
  user_id,
  employee_code,
  first_name,
  last_name,
  note
)
select
  membership.tenant_id,
  membership.user_id,
  'NV-' || upper(substr(replace(membership.user_id::text, '-', ''), 1, 8)),
  coalesce(nullif(btrim(profile.first_name), ''), nullif(btrim(profile.display_name), ''), 'Nhân viên'),
  coalesce(profile.last_name, ''),
  'Tự động khởi tạo từ thành viên tenant.'
from public.tenant_members membership
left join public.user_profiles profile on profile.id = membership.user_id
where membership.status = 'active'
on conflict (tenant_id, user_id) do nothing;

grant select, insert, update, delete on public.employees to authenticated;

alter table public.employees enable row level security;

create policy "Members with employee view can view employees"
on public.employees
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:employee:view')
);

create policy "Members with employee create can create employees"
on public.employees
for insert
to authenticated
with check (
  public.has_tenant_permission(tenant_id, 'organization:employee:create')
);

create policy "Members with employee update can update employees"
on public.employees
for update
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:employee:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:employee:update'));

create policy "Members with employee delete can delete employees"
on public.employees
for delete
to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:employee:delete'));
