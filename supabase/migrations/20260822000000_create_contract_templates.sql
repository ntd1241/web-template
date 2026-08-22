do $$
begin
  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'contract_template_status'
  ) then
    create type public.contract_template_status as enum (
      'draft', 'published', 'archived'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'contract_template_version_status'
  ) then
    create type public.contract_template_version_status as enum (
      'draft', 'published', 'superseded'
    );
  end if;
end;
$$;

create table public.contract_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  status public.contract_template_status not null default 'draft',
  currency_code text not null default 'VND',
  auto_renew_default boolean not null default false,
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_templates_tenant_code_unique unique (tenant_id, code),
  constraint contract_templates_code_not_blank check (length(btrim(code)) > 0),
  constraint contract_templates_name_not_blank check (length(btrim(name)) > 0),
  constraint contract_templates_currency_code_format check (currency_code ~ '^[A-Z]{3}$')
);

create index contract_templates_tenant_status_idx
  on public.contract_templates(tenant_id, status, updated_at desc, id desc);

create trigger contract_templates_set_updated_at
before update on public.contract_templates
for each row execute function public.set_updated_at();

create table public.contract_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.contract_templates(id) on delete cascade,
  version_no integer not null,
  status public.contract_template_version_status not null default 'draft',
  terms_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_template_versions_unique unique (template_id, version_no),
  constraint contract_template_versions_version_no_check check (version_no > 0),
  constraint contract_template_versions_published_check check (
    (status in ('published', 'superseded') and published_at is not null)
    or status = 'draft'
  )
);

create index contract_template_versions_template_status_idx
  on public.contract_template_versions(template_id, status, version_no desc);

create trigger contract_template_versions_set_updated_at
before update on public.contract_template_versions
for each row execute function public.set_updated_at();

create table public.contract_template_version_lines (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.contract_template_versions(id) on delete cascade,
  direction public.contract_cashflow_direction not null default 'receivable',
  name text not null,
  quantity numeric(18, 6) not null default 1,
  unit_price numeric(18, 2) not null,
  amount numeric(18, 2) generated always as (round(quantity * unit_price, 2)) stored,
  billing_type public.contract_billing_type not null,
  billing_unit public.contract_billing_unit,
  billing_interval integer,
  charge_date date,
  due_rule public.contract_due_rule not null default 'on_period_end',
  due_days integer,
  start_date date not null,
  end_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_template_version_lines_name_not_blank check (length(btrim(name)) > 0),
  constraint contract_template_version_lines_quantity_check check (quantity > 0),
  constraint contract_template_version_lines_unit_price_check check (unit_price >= 0),
  constraint contract_template_version_lines_billing_check check (
    (
      billing_type = 'recurring'
      and billing_unit is not null
      and billing_interval is not null
      and billing_interval > 0
      and charge_date is null
    )
    or (
      billing_type = 'one_time'
      and billing_unit is null
      and billing_interval is null
      and charge_date is not null
    )
  ),
  constraint contract_template_version_lines_due_rule_check check (
    (due_rule = 'after_days' and due_days is not null and due_days >= 0)
    or (due_rule <> 'after_days' and due_days is null)
  ),
  constraint contract_template_version_lines_date_range_check check (
    end_date is null or end_date >= start_date
  ),
  constraint contract_template_version_lines_charge_date_check check (
    charge_date is null or charge_date >= start_date
  ),
  constraint contract_template_version_lines_sort_order_check check (sort_order >= 0)
);

create index contract_template_version_lines_sort_idx
  on public.contract_template_version_lines(template_version_id, sort_order, id);

create trigger contract_template_version_lines_set_updated_at
before update on public.contract_template_version_lines
for each row execute function public.set_updated_at();

alter table public.contracts
  add column if not exists source_template_id uuid references public.contract_templates(id) on delete set null;

alter table public.contract_versions
  add column if not exists source_template_version_id uuid references public.contract_template_versions(id) on delete set null;

create index if not exists contracts_source_template_idx
  on public.contracts(tenant_id, source_template_id);

create index if not exists contract_versions_source_template_idx
  on public.contract_versions(source_template_version_id);

alter table public.contract_templates enable row level security;
alter table public.contract_template_versions enable row level security;
alter table public.contract_template_version_lines enable row level security;

create policy "Members with contract view can view contract templates"
on public.contract_templates
for select to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:view')
);

create policy "Members with contract create can create contract templates"
on public.contract_templates
for insert to authenticated
with check (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:create')
);

create policy "Members with contract update can update contract templates"
on public.contract_templates
for update to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:update')
)
with check (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:update')
);

create policy "Members with contract update can delete contract templates"
on public.contract_templates
for delete to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:update')
);

create policy "Members can view contract template versions"
on public.contract_template_versions
for select to authenticated
using (
  exists (
    select 1
    from public.contract_templates template
    where template.id = template_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:view')
  )
);

create policy "Members can manage contract template versions"
on public.contract_template_versions
for all to authenticated
using (
  exists (
    select 1
    from public.contract_templates template
    where template.id = template_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:update')
  )
)
with check (
  exists (
    select 1
    from public.contract_templates template
    where template.id = template_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:update')
  )
);

create policy "Members can view contract template version lines"
on public.contract_template_version_lines
for select to authenticated
using (
  exists (
    select 1
    from public.contract_template_versions version
    join public.contract_templates template on template.id = version.template_id
    where version.id = template_version_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:view')
  )
);

create policy "Members can manage contract template version lines"
on public.contract_template_version_lines
for all to authenticated
using (
  exists (
    select 1
    from public.contract_template_versions version
    join public.contract_templates template on template.id = version.template_id
    where version.id = template_version_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:update')
  )
)
with check (
  exists (
    select 1
    from public.contract_template_versions version
    join public.contract_templates template on template.id = version.template_id
    where version.id = template_version_id
      and public.is_tenant_member(template.tenant_id)
      and public.has_tenant_permission(template.tenant_id, 'contracts:update')
  )
);

create or replace function public.list_contract_templates(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_status public.contract_template_status default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 10), 1), 100);
  v_search text := nullif(btrim(p_search), '');
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract template view permission required' using errcode = '42501';
  end if;

  with filtered_templates as (
    select
      template.id,
      template.tenant_id,
      template.code,
      template.name,
      template.description,
      template.status,
      template.currency_code,
      template.auto_renew_default,
      template.note,
      template.created_by,
      template.created_at,
      template.updated_at,
      latest.version_no as latest_version_no,
      latest.status as latest_version_status,
      coalesce(line_count.total, 0)::integer as line_count,
      coalesce(contract_count.total, 0)::integer as contract_count,
      count(*) over () as total_count
    from public.contract_templates template
    left join lateral (
      select version.version_no, version.status
      from public.contract_template_versions version
      where version.template_id = template.id
      order by version.version_no desc
      limit 1
    ) latest on true
    left join lateral (
      select count(*) as total
      from public.contract_template_version_lines line
      join public.contract_template_versions version
        on version.id = line.template_version_id
      where version.template_id = template.id
        and version.version_no = coalesce(latest.version_no, 0)
    ) line_count on true
    left join lateral (
      select count(*) as total
      from public.contracts contract
      where contract.source_template_id = template.id
    ) contract_count on true
    where template.tenant_id = p_tenant_id
      and (p_status is null or template.status = p_status)
      and (
        v_search is null
        or template.code ilike '%' || v_search || '%'
        or template.name ilike '%' || v_search || '%'
        or template.description ilike '%' || v_search || '%'
      )
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'total_count'
          order by page_row.updated_at desc, page_row.id desc
        )
        from (
          select *
          from filtered_templates
          order by updated_at desc, id desc
          offset (v_page - 1) * v_page_size
          limit v_page_size
        ) page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_templates), 0)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_contract_templates(
  uuid, integer, integer, text, public.contract_template_status
) from public, anon;
grant execute on function public.list_contract_templates(
  uuid, integer, integer, text, public.contract_template_status
) to authenticated;

create or replace function public.publish_contract_template_version(
  p_tenant_id uuid,
  p_template_id uuid,
  p_version_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous_id uuid;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:update')
  then
    raise exception 'Contract template update permission required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.contract_templates
    where id = p_template_id and tenant_id = p_tenant_id
  ) then
    raise exception 'Contract template not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from public.contract_template_versions
    where id = p_version_id and template_id = p_template_id and status = 'draft'
  ) then
    raise exception 'Draft template version not found' using errcode = 'P0002';
  end if;

  select id into v_previous_id
  from public.contract_template_versions
  where template_id = p_template_id and status = 'published'
  order by version_no desc
  limit 1;

  if v_previous_id is not null then
    update public.contract_template_versions
    set status = 'superseded', updated_at = timezone('utc', now())
    where id = v_previous_id;
  end if;

  update public.contract_template_versions
  set status = 'published',
      published_at = timezone('utc', now()),
      updated_at = timezone('utc', now())
  where id = p_version_id;

  update public.contract_templates
  set status = 'published', updated_at = timezone('utc', now())
  where id = p_template_id;
end;
$$;

revoke execute on function public.publish_contract_template_version(uuid, uuid, uuid)
  from public, anon;
grant execute on function public.publish_contract_template_version(uuid, uuid, uuid)
  to authenticated;
