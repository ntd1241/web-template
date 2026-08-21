create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  storage_bucket text not null default 'tenant-assets',
  storage_path text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0,
  checksum_sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (tenant_id, id),
  unique (tenant_id, storage_bucket, storage_path),
  constraint files_file_name_not_blank check (length(btrim(file_name)) > 0),
  constraint files_storage_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint files_size_check check (size_bytes >= 0),
  constraint files_status_check check (status in ('active', 'deleted', 'quarantined'))
);

create table if not exists public.file_links (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  file_id uuid not null,
  subject_type text not null default 'contract',
  subject_id uuid not null,
  relation_type text not null default 'attachment',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, id),
  unique (tenant_id, file_id, subject_type, subject_id, relation_type),
  constraint file_links_subject_type_check check (subject_type = 'contract'),
  constraint file_links_relation_type_not_blank check (length(btrim(relation_type)) > 0),
  constraint file_links_file_same_tenant_fk
    foreign key (tenant_id, file_id)
    references public.files(tenant_id, id)
    on delete cascade
);

create index if not exists files_tenant_created_idx
  on public.files(tenant_id, created_at desc);

create index if not exists files_tenant_name_idx
  on public.files(tenant_id, lower(file_name));

create index if not exists file_links_subject_idx
  on public.file_links(tenant_id, subject_type, subject_id, created_at desc);

create index if not exists file_links_file_idx
  on public.file_links(tenant_id, file_id);

create or replace function public.validate_file_link_subject()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.subject_type = 'contract'
     and not exists (
       select 1
       from public.contracts contract
       where contract.tenant_id = new.tenant_id
         and contract.id = new.subject_id
     ) then
    raise exception 'File link subject contract does not exist for tenant';
  end if;

  return new;
end;
$$;

drop trigger if exists file_links_validate_subject on public.file_links;
create constraint trigger file_links_validate_subject
after insert or update of tenant_id, subject_type, subject_id on public.file_links
deferrable initially immediate
for each row execute function public.validate_file_link_subject();

alter table public.files enable row level security;
alter table public.file_links enable row level security;

drop policy if exists "Members can view files" on public.files;
create policy "Members can view files"
on public.files
for select
to authenticated
using (public.is_tenant_member(tenant_id) and status = 'active');

drop policy if exists "Members can manage files" on public.files;
create policy "Members can manage files"
on public.files
for all
to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

drop policy if exists "Members can view file links" on public.file_links;
create policy "Members can view file links"
on public.file_links
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "Members can manage file links" on public.file_links;
create policy "Members can manage file links"
on public.file_links
for all
to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));

grant select, insert, update, delete
  on public.files, public.file_links
  to authenticated;

insert into public.files (
  id,
  tenant_id,
  storage_bucket,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  uploaded_by,
  created_at
)
select
  attachment.id,
  attachment.tenant_id,
  'tenant-assets',
  attachment.storage_path,
  attachment.file_name,
  attachment.mime_type,
  attachment.size_bytes,
  attachment.uploaded_by,
  attachment.created_at
from public.contract_attachments attachment
on conflict (tenant_id, id) do nothing;

insert into public.file_links (
  id,
  tenant_id,
  file_id,
  subject_type,
  subject_id,
  relation_type,
  created_by,
  created_at
)
select
  attachment.id,
  attachment.tenant_id,
  attachment.id,
  'contract',
  attachment.contract_id,
  'attachment',
  attachment.uploaded_by,
  attachment.created_at
from public.contract_attachments attachment
on conflict (tenant_id, id) do nothing;
