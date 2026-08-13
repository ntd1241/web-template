create table public.tag_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  color text not null default '#2563eb',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, code),
  unique (tenant_id, id),
  constraint tag_groups_code_not_blank check (length(btrim(code)) > 0),
  constraint tag_groups_name_not_blank check (length(btrim(name)) > 0),
  constraint tag_groups_color_format check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  group_id uuid not null,
  code text not null,
  name text not null,
  color text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, code),
  unique (tenant_id, id),
  constraint tags_group_same_tenant_fk
    foreign key (tenant_id, group_id)
    references public.tag_groups(tenant_id, id)
    on delete restrict,
  constraint tags_code_not_blank check (length(btrim(code)) > 0),
  constraint tags_name_not_blank check (length(btrim(name)) > 0),
  constraint tags_color_format check (color is null or color ~ '^#[0-9A-Fa-f]{6}$')
);

create table public.tag_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  tag_id uuid not null,
  subject_type text not null,
  subject_id uuid not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, tag_id, subject_type, subject_id),
  constraint tag_assignments_tag_same_tenant_fk
    foreign key (tenant_id, tag_id)
    references public.tags(tenant_id, id)
    on delete cascade,
  constraint tag_assignments_subject_type_format check (
    subject_type ~ '^[a-z][a-z0-9_]*$'
  )
);

create index tag_groups_tenant_sort_idx
  on public.tag_groups(tenant_id, is_active, sort_order, name);
create index tags_tenant_group_sort_idx
  on public.tags(tenant_id, group_id, is_active, sort_order, name);
create index tag_assignments_subject_idx
  on public.tag_assignments(tenant_id, subject_type, subject_id, tag_id);
create index tag_assignments_tag_idx
  on public.tag_assignments(tenant_id, tag_id, subject_type, subject_id);
create unique index tag_groups_name_ci_idx
  on public.tag_groups(tenant_id, lower(name));
create unique index tags_name_ci_idx
  on public.tags(tenant_id, lower(name));

create trigger tag_groups_set_updated_at
before update on public.tag_groups
for each row execute function public.set_updated_at();

create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

alter table public.tag_groups enable row level security;
alter table public.tags enable row level security;
alter table public.tag_assignments enable row level security;

create policy "Members can view tag groups"
on public.tag_groups
for select
to authenticated
using (public.is_tenant_member(tenant_id) and is_active);

create policy "Tenant admins can manage tag groups"
on public.tag_groups
for all
to authenticated
using (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]))
with check (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]));

create policy "Members can view tags"
on public.tags
for select
to authenticated
using (public.is_tenant_member(tenant_id) and is_active);

create policy "Tenant admins can manage tags"
on public.tags
for all
to authenticated
using (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]))
with check (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]));

create policy "Members can view tag assignments"
on public.tag_assignments
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "Tenant admins can manage tag assignments"
on public.tag_assignments
for all
to authenticated
using (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]))
with check (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]));

create or replace function public.replace_tag_assignments(
  target_tenant_id uuid,
  target_subject_type text,
  target_subject_id uuid,
  target_tag_ids uuid[]
)
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
    raise exception 'Tenant admin role required' using errcode = '42501';
  end if;

  delete from public.tag_assignments
  where tenant_id = target_tenant_id
    and subject_type = target_subject_type
    and subject_id = target_subject_id;

  insert into public.tag_assignments (
    tenant_id,
    tag_id,
    subject_type,
    subject_id,
    created_by
  )
  select
    target_tenant_id,
    tag.id,
    target_subject_type,
    target_subject_id,
    auth.uid()
  from public.tags tag
  where tag.tenant_id = target_tenant_id
    and tag.is_active
    and tag.id = any(coalesce(target_tag_ids, '{}'::uuid[]))
  on conflict (tenant_id, tag_id, subject_type, subject_id) do nothing;
end;
$$;

revoke all on function public.replace_tag_assignments(uuid, text, uuid, uuid[])
from public, anon;
grant execute on function public.replace_tag_assignments(uuid, text, uuid, uuid[])
to authenticated;

insert into public.tag_groups (tenant_id, code, name, description, color, sort_order)
select
  tenant.id,
  seed.code,
  seed.name,
  seed.description,
  seed.color,
  seed.sort_order
from public.tenants tenant
cross join (
  values
    ('expertise', 'Chuyên môn', 'Nhãn mô tả chuyên môn hoặc lĩnh vực liên quan.', '#2563eb', 10),
    ('classification', 'Phân loại', 'Nhãn phục vụ phân loại và chăm sóc đối tượng.', '#7c3aed', 20)
) as seed(code, name, description, color, sort_order)
on conflict (tenant_id, code) do update set
  name = excluded.name,
  description = excluded.description,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.tags (tenant_id, group_id, code, name, color, sort_order)
select
  tag_group.tenant_id,
  tag_group.id,
  seed.code,
  seed.name,
  seed.color,
  seed.sort_order
from public.tag_groups tag_group
join (
  values
    ('expertise', 'luat', 'Luật', '#2563eb', 10),
    ('expertise', 'ke-toan', 'Kế toán', '#2563eb', 20),
    ('expertise', 'nhan-su', 'Nhân sự', '#2563eb', 30),
    ('classification', 'vip', 'VIP', '#7c3aed', 10),
    ('classification', 'tiem-nang', 'Tiềm năng', '#7c3aed', 20)
) as seed(group_code, code, name, color, sort_order)
  on seed.group_code = tag_group.code
on conflict (tenant_id, code) do update set
  group_id = excluded.group_id,
  name = excluded.name,
  color = excluded.color,
  sort_order = excluded.sort_order,
  is_active = true;

grant select on public.tag_groups, public.tags, public.tag_assignments to authenticated;
grant insert, update, delete on public.tag_groups, public.tags, public.tag_assignments to authenticated;
