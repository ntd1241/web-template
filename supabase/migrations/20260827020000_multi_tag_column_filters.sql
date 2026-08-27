-- Move employee, customer, and contract-template tag filters from one tag to
-- a grouped multi-select. Multiple selected tags use OR semantics.

drop function if exists public.list_employees(
  uuid, integer, integer, text, public.employee_status[], uuid[], boolean, uuid
);

create or replace function public.list_employees(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_statuses public.employee_status[] default null,
  p_role_ids uuid[] default null,
  p_account_linked boolean default null,
  p_tag_ids uuid[] default null
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
    or not public.has_tenant_permission(
      p_tenant_id,
      'organization:employee:view'
    )
  then
    raise exception 'Employee view permission required' using errcode = '42501';
  end if;

  with filtered_employees as (
    select
      employee.id,
      employee.tenant_id,
      employee.user_id,
      employee.employee_code,
      employee.first_name,
      employee.last_name,
      employee.job_title,
      employee.department,
      employee.phone,
      employee.status,
      employee.joined_at,
      employee.note,
      profile.avatar_url,
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object('name', role.name, 'color', role.color)
            order by role.name, role.id
          )
          from public.tenant_member_roles member_role
          join public.roles role
            on role.id = member_role.role_id
           and role.tenant_id = employee.tenant_id
           and role.is_active
          where member_role.tenant_id = employee.tenant_id
            and member_role.user_id = employee.user_id
        ),
        '[]'::jsonb
      ) as roles,
      count(*) over () as total_count
    from public.employees employee
    left join public.user_profiles profile
      on profile.id = employee.user_id
    where employee.tenant_id = p_tenant_id
      and (
        v_search is null
        or employee.employee_code ilike '%' || v_search || '%'
        or concat_ws(' ', employee.last_name, employee.first_name)
          ilike '%' || v_search || '%'
        or employee.job_title ilike '%' || v_search || '%'
        or employee.department ilike '%' || v_search || '%'
        or employee.phone ilike '%' || v_search || '%'
      )
      and (
        p_statuses is null
        or cardinality(p_statuses) = 0
        or employee.status = any(p_statuses)
      )
      and (
        p_role_ids is null
        or cardinality(p_role_ids) = 0
        or exists (
          select 1
          from public.tenant_member_roles member_role
          where member_role.tenant_id = employee.tenant_id
            and member_role.user_id = employee.user_id
            and member_role.role_id = any(p_role_ids)
        )
      )
      and (
        p_account_linked is null
        or (employee.user_id is not null) = p_account_linked
      )
      and (
        p_tag_ids is null
        or cardinality(p_tag_ids) = 0
        or exists (
          select 1
          from public.tag_assignments assignment
          where assignment.tenant_id = employee.tenant_id
            and assignment.subject_type = 'employee'
            and assignment.subject_id = employee.id
            and assignment.tag_id = any(p_tag_ids)
        )
      )
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'total_count'
          order by page_row.last_name asc, page_row.first_name asc, page_row.id asc
        )
        from (
          select *
          from filtered_employees
          order by last_name asc, first_name asc, id asc
          offset (v_page - 1) * v_page_size
          limit v_page_size
        ) page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_employees), 0)
  )
  into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_employees(
  uuid, integer, integer, text, public.employee_status[], uuid[], boolean, uuid[]
) from public, anon;

grant execute on function public.list_employees(
  uuid, integer, integer, text, public.employee_status[], uuid[], boolean, uuid[]
) to authenticated;

drop function if exists public.list_customers(
  uuid, integer, integer, text, text, public.business_type[], text,
  public.customer_status[], uuid
);

create or replace function public.list_customers(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_customer_search text default null,
  p_business_types public.business_type[] default null,
  p_contact_search text default null,
  p_statuses public.customer_status[] default null,
  p_tag_ids uuid[] default null
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
  v_customer_search text := nullif(btrim(p_customer_search), '');
  v_contact_search text := nullif(btrim(p_contact_search), '');
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'customers:view')
  then
    raise exception 'Customer view permission required' using errcode = '42501';
  end if;

  with filtered_customers as (
    select
      customer.id,
      customer.tenant_id,
      customer.customer_code,
      customer.name,
      customer.business_type,
      customer.business_registration_code,
      customer.image_url,
      customer.country_code,
      customer.region_code,
      customer.region_name,
      customer.phone,
      customer.email,
      customer.address_detail,
      customer.status,
      customer.note,
      customer.created_at,
      count(*) over () as total_count
    from public.customers customer
    where customer.tenant_id = p_tenant_id
      and (
        v_search is null
        or customer.customer_code ilike '%' || v_search || '%'
        or customer.name ilike '%' || v_search || '%'
        or customer.phone ilike '%' || v_search || '%'
        or customer.email ilike '%' || v_search || '%'
        or customer.address_detail ilike '%' || v_search || '%'
      )
      and (
        v_customer_search is null
        or customer.customer_code ilike '%' || v_customer_search || '%'
        or customer.name ilike '%' || v_customer_search || '%'
      )
      and (
        p_business_types is null
        or cardinality(p_business_types) = 0
        or customer.business_type = any(p_business_types)
      )
      and (
        v_contact_search is null
        or customer.phone ilike '%' || v_contact_search || '%'
        or customer.email ilike '%' || v_contact_search || '%'
      )
      and (
        p_statuses is null
        or cardinality(p_statuses) = 0
        or customer.status = any(p_statuses)
      )
      and (
        p_tag_ids is null
        or cardinality(p_tag_ids) = 0
        or exists (
          select 1
          from public.tag_assignments assignment
          where assignment.tenant_id = customer.tenant_id
            and assignment.subject_type = 'customer'
            and assignment.subject_id = customer.id
            and assignment.tag_id = any(p_tag_ids)
        )
      )
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'total_count' - 'created_at'
          order by page_row.created_at asc, page_row.id asc
        )
        from (
          select *
          from filtered_customers
          order by created_at asc, id asc
          offset (v_page - 1) * v_page_size
          limit v_page_size
        ) page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_customers), 0)
  ) into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_customers(
  uuid, integer, integer, text, text, public.business_type[], text,
  public.customer_status[], uuid[]
) from public, anon;

grant execute on function public.list_customers(
  uuid, integer, integer, text, text, public.business_type[], text,
  public.customer_status[], uuid[]
) to authenticated;

drop function if exists public.list_contract_templates(
  uuid, integer, integer, text, text, public.contract_template_status[],
  integer, integer, integer, integer, integer, integer, date, date
);

create or replace function public.list_contract_templates(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_template_search text default null,
  p_statuses public.contract_template_status[] default null,
  p_tag_ids uuid[] default null,
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
        p_tag_ids is null
        or cardinality(p_tag_ids) = 0
        or exists (
          select 1
          from public.tag_assignments assignment
          where assignment.tenant_id = template.tenant_id
            and assignment.subject_type = 'contract_template'
            and assignment.subject_id = template.id
            and assignment.tag_id = any(p_tag_ids)
        )
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
  uuid[], integer, integer, integer, integer, integer, integer, date, date
) from public, anon;

grant execute on function public.list_contract_templates(
  uuid, integer, integer, text, text, public.contract_template_status[],
  uuid[], integer, integer, integer, integer, integer, integer, date, date
) to authenticated;

notify pgrst, 'reload schema';
