drop function if exists public.list_contract_templates(
  uuid, integer, integer, text, public.contract_template_status
);

create or replace function public.list_contract_templates(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_template_search text default null,
  p_statuses public.contract_template_status[] default null,
  p_line_count_min integer default null,
  p_line_count_max integer default null,
  p_contract_count_min integer default null,
  p_contract_count_max integer default null,
  p_version_no_min integer default null,
  p_version_no_max integer default null,
  p_updated_from date default null,
  p_updated_to date default null
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
  v_template_search text := nullif(btrim(p_template_search), '');
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
      and (
        v_search is null
        or template.code ilike '%' || v_search || '%'
        or template.name ilike '%' || v_search || '%'
        or template.description ilike '%' || v_search || '%'
      )
      and (
        v_template_search is null
        or template.code ilike '%' || v_template_search || '%'
        or template.name ilike '%' || v_template_search || '%'
      )
      and (
        p_statuses is null
        or cardinality(p_statuses) = 0
        or template.status = any(p_statuses)
      )
      and (
        p_line_count_min is null
        or coalesce(line_count.total, 0) >= p_line_count_min
      )
      and (
        p_line_count_max is null
        or coalesce(line_count.total, 0) <= p_line_count_max
      )
      and (
        p_contract_count_min is null
        or coalesce(contract_count.total, 0) >= p_contract_count_min
      )
      and (
        p_contract_count_max is null
        or coalesce(contract_count.total, 0) <= p_contract_count_max
      )
      and (
        p_version_no_min is null
        or coalesce(latest.version_no, 0) >= p_version_no_min
      )
      and (
        p_version_no_max is null
        or coalesce(latest.version_no, 0) <= p_version_no_max
      )
      and (
        p_updated_from is null
        or template.updated_at::date >= p_updated_from
      )
      and (
        p_updated_to is null
        or template.updated_at::date <= p_updated_to
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
  uuid, integer, integer, text, text, public.contract_template_status[],
  integer, integer, integer, integer, integer, integer, date, date
) from public, anon;

grant execute on function public.list_contract_templates(
  uuid, integer, integer, text, text, public.contract_template_status[],
  integer, integer, integer, integer, integer, integer, date, date
) to authenticated;

notify pgrst, 'reload schema';
