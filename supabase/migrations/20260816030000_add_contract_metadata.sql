alter table public.contracts
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists contracts_created_by_idx
  on public.contracts(tenant_id, created_by);

create table if not exists public.contract_responsibles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, contract_id, employee_id)
);

create index if not exists contract_responsibles_contract_idx
  on public.contract_responsibles(tenant_id, contract_id, employee_id);

create table if not exists public.contract_attachments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null references public.contracts(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint contract_attachments_file_name_not_blank check (length(btrim(file_name)) > 0),
  constraint contract_attachments_storage_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint contract_attachments_size_check check (size_bytes >= 0),
  unique (tenant_id, storage_path)
);

create index if not exists contract_attachments_contract_idx
  on public.contract_attachments(tenant_id, contract_id, created_at desc);

grant select, insert, update, delete
  on public.contract_responsibles, public.contract_attachments
  to authenticated;

grant update on public.contracts to authenticated;
