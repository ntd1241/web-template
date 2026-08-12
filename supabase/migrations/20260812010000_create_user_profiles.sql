create type public.user_profile_status as enum (
  'active',
  'suspended',
  'deactivated'
);

create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  first_name text,
  last_name text,
  avatar_url text,
  status public.user_profile_status not null default 'active',
  locale text not null default 'vi',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  settings jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint user_profiles_display_name_not_blank check (
    display_name is null or length(btrim(display_name)) > 0
  ),
  constraint user_profiles_locale_not_blank check (length(btrim(locale)) > 0),
  constraint user_profiles_timezone_not_blank check (length(btrim(timezone)) > 0)
);

create index user_profiles_status_idx on public.user_profiles(status);

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    display_name,
    avatar_url,
    metadata
  )
  values (
    new.id,
    nullif(
      btrim(
        coalesce(
          new.raw_user_meta_data ->> 'display_name',
          new.raw_user_meta_data ->> 'full_name'
        )
      ),
      ''
    ),
    nullif(btrim(new.raw_user_meta_data ->> 'avatar_url'), ''),
    jsonb_build_object(
      'authProvider', coalesce(new.raw_app_meta_data ->> 'provider', 'email')
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

insert into public.user_profiles (id, display_name, avatar_url, metadata)
select
  id,
  nullif(
    btrim(
      coalesce(
        raw_user_meta_data ->> 'display_name',
        raw_user_meta_data ->> 'full_name'
      )
    ),
    ''
  ),
  nullif(btrim(raw_user_meta_data ->> 'avatar_url'), ''),
  jsonb_build_object(
    'authProvider', coalesce(raw_app_meta_data ->> 'provider', 'email')
  )
from auth.users
on conflict (id) do nothing;

create or replace function public.can_view_user_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select $1 = auth.uid()
    or exists (
      select 1
      from public.tenant_members viewer_membership
      join public.tenant_members target_membership
        on target_membership.tenant_id = viewer_membership.tenant_id
      where viewer_membership.user_id = auth.uid()
        and viewer_membership.status = 'active'
        and target_membership.user_id = $1
        and target_membership.status <> 'removed'
    );
$$;

revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
revoke execute on function public.can_view_user_profile(uuid) from public, anon;
grant execute on function public.can_view_user_profile(uuid) to authenticated;

grant select, update on public.user_profiles to authenticated;

alter table public.user_profiles enable row level security;

create policy "Users can view allowed profiles"
on public.user_profiles
for select
to authenticated
using (public.can_view_user_profile(id));

create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
