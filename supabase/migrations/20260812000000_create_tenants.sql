create extension if not exists pgcrypto;

create type public.tenant_status as enum ('active', 'suspended', 'archived');
create type public.tenant_plan as enum ('free', 'starter', 'business', 'enterprise');
create type public.tenant_member_role as enum ('owner', 'admin', 'member');
create type public.tenant_member_status as enum (
  'invited',
  'active',
  'suspended',
  'removed'
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  legal_name text,
  logo_url text,
  status public.tenant_status not null default 'active',
  plan public.tenant_plan not null default 'free',
  settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint tenants_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tenants_name_not_blank check (length(btrim(name)) > 0),
  constraint tenants_archived_at_consistency check (
    (status = 'archived' and archived_at is not null) or
    (status <> 'archived' and archived_at is null)
  )
);

create table public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.tenant_member_role not null default 'member',
  status public.tenant_member_status not null default 'active',
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (tenant_id, user_id),
  constraint tenant_members_invited_at_consistency check (
    status <> 'invited' or invited_at is not null
  ),
  constraint tenant_members_joined_at_consistency check (
    status not in ('active', 'suspended') or joined_at is not null
  )
);

create index tenant_members_user_id_idx on public.tenant_members(user_id);
create index tenants_status_idx on public.tenants(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger tenants_set_updated_at
before update on public.tenants
for each row execute function public.set_updated_at();

create trigger tenant_members_set_updated_at
before update on public.tenant_members
for each row execute function public.set_updated_at();

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function public.has_tenant_role(
  target_tenant_id uuid,
  allowed_roles public.tenant_member_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_members
    where tenant_id = target_tenant_id
      and user_id = auth.uid()
      and status = 'active'
      and role = any(allowed_roles)
  );
$$;

create or replace function public.create_tenant(
  tenant_name text,
  tenant_slug text,
  tenant_legal_name text default null,
  tenant_plan public.tenant_plan default 'free'
)
returns public.tenants
language plpgsql
security definer
set search_path = public
as $$
declare
  created_tenant public.tenants;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  insert into public.tenants (name, slug, legal_name, plan, created_by)
  values (tenant_name, lower(tenant_slug), tenant_legal_name, tenant_plan, auth.uid())
  returning * into created_tenant;

  insert into public.tenant_members (tenant_id, user_id, role, status, joined_at)
  values (created_tenant.id, auth.uid(), 'owner', 'active', timezone('utc', now()));

  return created_tenant;
end;
$$;

grant execute on function public.create_tenant(text, text, text, public.tenant_plan)
to authenticated;
revoke execute on function public.create_tenant(text, text, text, public.tenant_plan)
from public, anon;

revoke execute on function public.is_tenant_member(uuid) from public, anon;
grant execute on function public.is_tenant_member(uuid) to authenticated;
revoke execute on function public.has_tenant_role(uuid, public.tenant_member_role[])
from public, anon;
grant execute on function public.has_tenant_role(uuid, public.tenant_member_role[])
to authenticated;

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;

create policy "Members can view their tenants"
on public.tenants
for select
to authenticated
using (public.is_tenant_member(id));

create policy "Tenant admins can update tenant"
on public.tenants
for update
to authenticated
using (public.has_tenant_role(id, array['owner', 'admin']::public.tenant_member_role[]))
with check (public.has_tenant_role(id, array['owner', 'admin']::public.tenant_member_role[]));

create policy "Members can view tenant membership"
on public.tenant_members
for select
to authenticated
using (public.is_tenant_member(tenant_id));

create policy "Tenant admins can manage membership"
on public.tenant_members
for all
to authenticated
using (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]))
with check (public.has_tenant_role(tenant_id, array['owner', 'admin']::public.tenant_member_role[]));
