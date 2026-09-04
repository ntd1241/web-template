-- Tenant-scoped metadata for fields that vary by business entity.
-- Values are stored once per entity in entity_custom_data.data JSONB; the
-- definition tables remain relational so the UI, validation and options stay queryable.

create type public.custom_field_entity_type as enum ('customer', 'employee', 'contract');
create type public.custom_field_type as enum ('text', 'number', 'select');

create table public.tenant_custom_field_definitions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  entity_type public.custom_field_entity_type not null,
  field_key text not null,
  label text not null,
  field_type public.custom_field_type not null,
  is_required boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tenant_custom_field_definitions_key_not_blank check (length(btrim(field_key)) > 0),
  constraint tenant_custom_field_definitions_label_not_blank check (length(btrim(label)) > 0),
  constraint tenant_custom_field_definitions_key_format check (field_key ~ '^[a-z][a-z0-9_]*$'),
  constraint tenant_custom_field_definitions_sort_order_nonnegative check (sort_order >= 0),
  unique (tenant_id, entity_type, field_key)
);

create table public.tenant_custom_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.tenant_custom_field_definitions(id) on delete cascade,
  value text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  constraint tenant_custom_field_options_value_not_blank check (length(btrim(value)) > 0),
  constraint tenant_custom_field_options_label_not_blank check (length(btrim(label)) > 0),
  constraint tenant_custom_field_options_sort_order_nonnegative check (sort_order >= 0),
  unique (field_id, value)
);

create table public.entity_custom_data (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  entity_type public.custom_field_entity_type not null,
  entity_id uuid not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint entity_custom_data_object_check check (jsonb_typeof(data) = 'object'),
  unique (tenant_id, entity_type, entity_id)
);

create index tenant_custom_field_definitions_tenant_entity_idx
  on public.tenant_custom_field_definitions (tenant_id, entity_type, sort_order, label);
create index tenant_custom_field_options_field_idx
  on public.tenant_custom_field_options (field_id, sort_order, label);
create index entity_custom_data_lookup_idx
  on public.entity_custom_data (tenant_id, entity_type, entity_id);
create index entity_custom_data_data_gin_idx
  on public.entity_custom_data using gin (data);

create trigger tenant_custom_field_definitions_set_updated_at
before update on public.tenant_custom_field_definitions
for each row execute function public.set_updated_at();

create trigger entity_custom_data_set_updated_at
before update on public.entity_custom_data
for each row execute function public.set_updated_at();

alter table public.tenant_custom_field_definitions enable row level security;
alter table public.tenant_custom_field_options enable row level security;
alter table public.entity_custom_data enable row level security;

grant select, insert, update, delete on public.tenant_custom_field_definitions to authenticated;
grant select, insert, update, delete on public.tenant_custom_field_options to authenticated;
grant select, insert, update, delete on public.entity_custom_data to authenticated;

create policy "Members with settings view can view custom field definitions"
on public.tenant_custom_field_definitions
for select to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'organization:custom-field:view')
);

create policy "Members with settings edit can create custom field definitions"
on public.tenant_custom_field_definitions
for insert to authenticated
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:create'));

create policy "Members with settings edit can update custom field definitions"
on public.tenant_custom_field_definitions
for update to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'))
with check (public.has_tenant_permission(tenant_id, 'organization:custom-field:update'));

create policy "Members with settings edit can delete custom field definitions"
on public.tenant_custom_field_definitions
for delete to authenticated
using (public.has_tenant_permission(tenant_id, 'organization:custom-field:delete'));

create policy "Members with settings view can view custom field options"
on public.tenant_custom_field_options
for select to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.is_tenant_member(definition.tenant_id)
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:view')
  )
);

create policy "Members with settings edit can manage custom field options"
on public.tenant_custom_field_options
for all to authenticated
using (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
)
with check (
  exists (
    select 1
    from public.tenant_custom_field_definitions definition
    where definition.id = field_id
      and public.has_tenant_permission(definition.tenant_id, 'organization:custom-field:update')
  )
);

create policy "Members can view entity custom data"
on public.entity_custom_data
for select to authenticated
using (public.is_tenant_member(tenant_id));

create policy "Members can manage entity custom data"
on public.entity_custom_data
for all to authenticated
using (public.is_tenant_member(tenant_id))
with check (public.is_tenant_member(tenant_id));
