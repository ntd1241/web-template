create index if not exists employees_tenant_name_idx
  on public.employees(tenant_id, last_name, first_name, id);

create index if not exists tenant_member_roles_tenant_role_user_idx
  on public.tenant_member_roles(tenant_id, role_id, user_id);

create or replace function public.list_employees(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_statuses public.employee_status[] default null,
  p_role_ids uuid[] default null,
  p_account_linked boolean default null,
  p_tag_id uuid default null
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
        p_tag_id is null
        or exists (
          select 1
          from public.tag_assignments assignment
          where assignment.tenant_id = employee.tenant_id
            and assignment.subject_type = 'employee'
            and assignment.subject_id = employee.id
            and assignment.tag_id = p_tag_id
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
  uuid, integer, integer, text, public.employee_status[], uuid[], boolean, uuid
) from public, anon;

grant execute on function public.list_employees(
  uuid, integer, integer, text, public.employee_status[], uuid[], boolean, uuid
) to authenticated;

notify pgrst, 'reload schema';
