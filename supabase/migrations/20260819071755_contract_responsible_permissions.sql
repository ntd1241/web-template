-- Contract responsibility is metadata, not a contract version. Permissions are
-- inherited from the employee's tenant permissions and can only be narrowed
-- for a specific contract.

insert into public.permission_definitions (
  code,
  module_code,
  group_name,
  name,
  action,
  sensitive,
  sort_order,
  is_active,
  group_id,
  tags
)
select
  'contracts:assign',
  permission_group.module_code,
  permission_group.name,
  'Phân công nhân viên và quyền theo hợp đồng',
  'update',
  true,
  35,
  true,
  permission_group.id,
  array['Chỉnh sửa']::text[]
from public.permission_groups permission_group
where permission_group.module_code = 'contracts'
  and permission_group.code = 'contracts'
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  is_active = true,
  group_id = excluded.group_id,
  tags = excluded.tags;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, 'contracts:assign'
from public.roles role_record
where role_record.code in ('admin', 'manager')
on conflict do nothing;

create or replace function public.ensure_tenant_permission_defaults(target_tenant_id uuid)
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
    raise exception 'Tenant administrator required' using errcode = '42501';
  end if;

  insert into public.roles (tenant_id, code, name, description, scope, is_system)
  values
    (target_tenant_id, 'admin', 'Admin', 'Toàn quyền vận hành hệ thống', 'all', true),
    (target_tenant_id, 'manager', 'Quản lý', 'Quản lý nghiệp vụ và duyệt thao tác quan trọng', 'all', false),
    (target_tenant_id, 'employee', 'Nhân viên', 'Thao tác nghiệp vụ hằng ngày', 'self', false),
    (target_tenant_id, 'accountant', 'Kế toán', 'Theo dõi đơn hàng, báo cáo và công nợ', 'department', false)
  on conflict (tenant_id, code) do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, definition.code
  from public.roles role_record
  cross join public.permission_definitions definition
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'admin'
    and definition.is_active
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'employees:account:view', 'employees:account:edit', 'employees:account:lock',
    'employees:profile:view', 'employees:profile:edit', 'orders:view', 'orders:edit',
    'orders:approve', 'orders:cancel', 'orders:shipping-status', 'warehouse:stock:view',
    'warehouse:import:edit', 'warehouse:export:edit', 'reports:revenue:view',
    'reports:inventory:view', 'system:roles:view', 'system:settings:view',
    'system:audit-log:view', 'system:tag:view', 'system:tag:create',
    'system:tag:update', 'contracts:view', 'contracts:create', 'contracts:update',
    'contracts:publish', 'contracts:amend', 'contracts:assign'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'manager'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'employees:account:view', 'employees:profile:view', 'orders:view',
    'warehouse:stock:view', 'reports:revenue:view', 'reports:inventory:view',
    'system:tag:view'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'employee'
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  select role_record.id, permission_code
  from public.roles role_record
  cross join unnest(array[
    'orders:view', 'orders:approve', 'reports:revenue:view', 'reports:inventory:view',
    'reports:debt:view', 'warehouse:stock:view', 'system:roles:view',
    'contracts:view', 'contracts:record-payment', 'contracts:reverse-payment'
  ]::text[]) as selected(permission_code)
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'accountant'
  on conflict do nothing;

  insert into public.tenant_member_roles (tenant_id, user_id, role_id)
  select target_tenant_id, auth.uid(), role_record.id
  from public.roles role_record
  where role_record.tenant_id = target_tenant_id
    and role_record.code = 'admin'
  on conflict do nothing;
end;
$$;

create table if not exists public.contract_responsible_permission_overrides (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contract_id uuid not null,
  employee_id uuid not null,
  permission_code text not null references public.permission_definitions(code) on delete restrict,
  effect public.permission_effect not null default 'deny',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (tenant_id, contract_id, employee_id, permission_code),
  constraint contract_responsible_permission_override_effect_check check (effect = 'deny'),
  constraint contract_responsible_permission_override_assignment_fk
    foreign key (tenant_id, contract_id, employee_id)
    references public.contract_responsibles(tenant_id, contract_id, employee_id)
    on delete cascade
);

create index if not exists contract_responsible_permission_overrides_lookup_idx
  on public.contract_responsible_permission_overrides(
    tenant_id, contract_id, employee_id, effect
  );

create trigger contract_responsible_permission_overrides_set_updated_at
before update on public.contract_responsible_permission_overrides
for each row execute function public.set_updated_at();

grant select on public.contract_responsible_permission_overrides to authenticated;
alter table public.contract_responsibles enable row level security;
alter table public.contract_responsible_permission_overrides enable row level security;

drop policy if exists "Members with contract view can view contract responsibles"
  on public.contract_responsibles;
create policy "Members with contract view can view contract responsibles"
on public.contract_responsibles
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:view')
);

drop policy if exists "Members with contract view can view responsible overrides"
  on public.contract_responsible_permission_overrides;
create policy "Members with contract view can view responsible overrides"
on public.contract_responsible_permission_overrides
for select
to authenticated
using (
  public.is_tenant_member(tenant_id)
  and public.has_tenant_permission(tenant_id, 'contracts:view')
);

-- Assignment mutations go through the transaction-safe RPC below.
revoke insert, update, delete on public.contract_responsibles from authenticated;
revoke insert, update, delete on public.contract_responsible_permission_overrides
  from authenticated;

create or replace function public.has_contract_permission(
  target_contract_id uuid,
  required_permission_code text,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.contracts contract
    where contract.id = target_contract_id
      and (
        public.has_tenant_role(
          contract.tenant_id,
          array['owner', 'admin']::public.tenant_member_role[]
        )
        or (
          public.has_tenant_permission(
            contract.tenant_id,
            required_permission_code,
            target_user_id
          )
          and (
            exists (
              select 1
              from public.tenant_member_roles member_role
              join public.roles role_record on role_record.id = member_role.role_id
              where member_role.tenant_id = contract.tenant_id
                and member_role.user_id = target_user_id
                and role_record.scope = 'all'
                and role_record.is_active
            )
            or exists (
              select 1
              from public.contract_responsibles responsible
              join public.employees employee on employee.id = responsible.employee_id
              where responsible.tenant_id = contract.tenant_id
                and responsible.contract_id = contract.id
                and employee.user_id = target_user_id
                and employee.status = 'active'
            )
          )
          and not exists (
            select 1
            from public.contract_responsible_permission_overrides permission_override
            join public.employees employee on employee.id = permission_override.employee_id
            where permission_override.tenant_id = contract.tenant_id
              and permission_override.contract_id = contract.id
              and employee.user_id = target_user_id
              and permission_override.permission_code = required_permission_code
              and permission_override.effect = 'deny'
          )
        )
      )
  );
$$;

revoke execute on function public.has_contract_permission(uuid, text, uuid)
  from public, anon;
grant execute on function public.has_contract_permission(uuid, text, uuid)
  to authenticated;

create or replace function public.get_contract_responsible_workspace(
  p_tenant_id uuid,
  p_contract_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:assign')
  then
    raise exception 'Contract assignment permission required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.contracts contract
    where contract.id = p_contract_id
      and contract.tenant_id = p_tenant_id
  ) then
    raise exception 'Contract does not belong to tenant' using errcode = '42501';
  end if;

  with employee_rows as (
    select
      employee.id,
      employee.user_id,
      employee.employee_code,
      employee.first_name,
      employee.last_name,
      employee.job_title,
      employee.department,
      employee.status,
      profile.avatar_url,
      coalesce(
        (
          select jsonb_agg(permission_definition.code order by permission_definition.sort_order, permission_definition.code)
          from public.permission_definitions permission_definition
          where permission_definition.is_active
            and permission_definition.module_code in ('contracts', 'receivables')
            and (
              exists (
                select 1
                from public.tenant_member_roles member_role
                join public.role_permissions role_permission
                  on role_permission.role_id = member_role.role_id
                where member_role.tenant_id = p_tenant_id
                  and member_role.user_id = employee.user_id
                  and role_permission.permission_code = permission_definition.code
              )
              or exists (
                select 1
                from public.user_permission_overrides permission_override
                where permission_override.tenant_id = p_tenant_id
                  and permission_override.user_id = employee.user_id
                  and permission_override.permission_code = permission_definition.code
                  and permission_override.effect = 'allow'
              )
            )
            and not exists (
              select 1
              from public.user_permission_overrides permission_override
              where permission_override.tenant_id = p_tenant_id
                and permission_override.user_id = employee.user_id
                and permission_override.permission_code = permission_definition.code
                and permission_override.effect = 'deny'
            )
        ),
        '[]'::jsonb
      ) as default_permission_codes
    from public.employees employee
    left join public.user_profiles profile on profile.id = employee.user_id
    where employee.tenant_id = p_tenant_id
      and (
        employee.status = 'active'
        or exists (
          select 1
          from public.contract_responsibles responsible
          where responsible.tenant_id = p_tenant_id
            and responsible.contract_id = p_contract_id
            and responsible.employee_id = employee.id
        )
      )
  ), assignment_rows as (
    select
      responsible.employee_id,
      responsible.assigned_by,
      responsible.created_at,
      coalesce(
        (
          select jsonb_agg(permission_override.permission_code order by permission_override.permission_code)
          from public.contract_responsible_permission_overrides permission_override
          where permission_override.tenant_id = p_tenant_id
            and permission_override.contract_id = p_contract_id
            and permission_override.employee_id = responsible.employee_id
            and permission_override.effect = 'deny'
        ),
        '[]'::jsonb
      ) as disabled_permission_codes
    from public.contract_responsibles responsible
    where responsible.tenant_id = p_tenant_id
      and responsible.contract_id = p_contract_id
  )
  select jsonb_build_object(
    'employees', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', employee.id,
            'userId', employee.user_id,
            'employeeCode', employee.employee_code,
            'displayName', trim(concat(employee.last_name, ' ', employee.first_name)),
            'jobTitle', employee.job_title,
            'department', employee.department,
            'status', employee.status,
            'avatarUrl', employee.avatar_url,
            'defaultPermissionCodes', employee.default_permission_codes
          )
          order by employee.status asc, employee.last_name, employee.first_name, employee.employee_code
        )
        from employee_rows employee
      ),
      '[]'::jsonb
    ),
    'assignments', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'employeeId', assignment.employee_id,
            'assignedBy', assignment.assigned_by,
            'createdAt', assignment.created_at,
            'disabledPermissionCodes', assignment.disabled_permission_codes
          )
          order by assignment.created_at, assignment.employee_id
        )
        from assignment_rows assignment
      ),
      '[]'::jsonb
    ),
    'permissionDefinitions', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'code', definition.code,
            'moduleCode', definition.module_code,
            'groupName', definition.group_name,
            'name', definition.name,
            'action', definition.action,
            'sensitive', definition.sensitive,
            'sortOrder', definition.sort_order
          )
          order by definition.sort_order, definition.code
        )
        from public.permission_definitions definition
        where definition.is_active
          and definition.module_code in ('contracts', 'receivables')
          and definition.code <> 'contracts:assign'
          and definition.code <> 'contracts:create'
      ),
      '[]'::jsonb
    )
  ) into v_result;

  return v_result;
end;
$$;

create or replace function public.replace_contract_responsible_access(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_assignments jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_assignment_count integer;
begin
  if auth.uid() is null
    or (
      not public.has_contract_permission(p_contract_id, 'contracts:assign')
      and not exists (
        select 1
        from public.contracts contract
        where contract.id = p_contract_id
          and contract.tenant_id = p_tenant_id
          and contract.created_by = auth.uid()
          and contract.status = 'draft'
      )
    )
  then
    raise exception 'Contract assignment permission required' using errcode = '42501';
  end if;

  if p_assignments is null or jsonb_typeof(p_assignments) <> 'array' then
    raise exception 'Assignments must be an array' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.contracts contract
    where contract.id = p_contract_id
      and contract.tenant_id = p_tenant_id
  ) then
    raise exception 'Contract does not belong to tenant' using errcode = '42501';
  end if;

  select count(*) into v_assignment_count
  from jsonb_array_elements(p_assignments) assignment;

  if exists (
    select employee_id
    from (
      select (assignment->>'employee_id')::uuid as employee_id
      from jsonb_array_elements(p_assignments) assignment
    ) parsed
    group by employee_id
    having count(*) > 1
  ) then
    raise exception 'An employee can only be assigned once' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_assignments) assignment
    where (assignment->>'employee_id') is null
      or not exists (
        select 1
        from public.employees employee
        where employee.id = (assignment->>'employee_id')::uuid
          and employee.tenant_id = p_tenant_id
          and employee.status = 'active'
      )
  ) then
    raise exception 'Assignments contain an invalid or inactive employee' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_assignments) assignment
    cross join lateral jsonb_array_elements_text(
      coalesce(assignment->'disabled_permission_codes', '[]'::jsonb)
    ) disabled(permission_code)
    where not exists (
      select 1
      from public.permission_definitions definition
      where definition.code = disabled.permission_code
        and definition.is_active
        and definition.module_code in ('contracts', 'receivables')
        and definition.code <> 'contracts:assign'
    )
  ) then
    raise exception 'Assignments contain an invalid permission' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_assignments) assignment
    join public.employees employee
      on employee.id = (assignment->>'employee_id')::uuid
    cross join lateral jsonb_array_elements_text(
      coalesce(assignment->'disabled_permission_codes', '[]'::jsonb)
    ) disabled(permission_code)
    where not exists (
      select 1
      from public.permission_definitions definition
      where definition.code = disabled.permission_code
        and (
          exists (
            select 1
            from public.tenant_member_roles member_role
            join public.role_permissions role_permission
              on role_permission.role_id = member_role.role_id
            where member_role.tenant_id = p_tenant_id
              and member_role.user_id = employee.user_id
              and role_permission.permission_code = definition.code
          )
          or exists (
            select 1
            from public.user_permission_overrides permission_override
            where permission_override.tenant_id = p_tenant_id
              and permission_override.user_id = employee.user_id
              and permission_override.permission_code = definition.code
              and permission_override.effect = 'allow'
          )
        )
        and not exists (
          select 1
          from public.user_permission_overrides permission_override
          where permission_override.tenant_id = p_tenant_id
            and permission_override.user_id = employee.user_id
            and permission_override.permission_code = definition.code
            and permission_override.effect = 'deny'
        )
    )
  ) then
    raise exception 'Cannot override a permission the employee does not have' using errcode = '42501';
  end if;

  delete from public.contract_responsible_permission_overrides
  where tenant_id = p_tenant_id
    and contract_id = p_contract_id;

  delete from public.contract_responsibles
  where tenant_id = p_tenant_id
    and contract_id = p_contract_id;

  insert into public.contract_responsibles (
    tenant_id, contract_id, employee_id, assigned_by
  )
  select
    p_tenant_id,
    p_contract_id,
    (assignment->>'employee_id')::uuid,
    auth.uid()
  from jsonb_array_elements(p_assignments) assignment;

  insert into public.contract_responsible_permission_overrides (
    tenant_id, contract_id, employee_id, permission_code, effect
  )
  select
    p_tenant_id,
    p_contract_id,
    (assignment->>'employee_id')::uuid,
    disabled.permission_code,
    'deny'
  from jsonb_array_elements(p_assignments) assignment
  cross join lateral jsonb_array_elements_text(
    coalesce(assignment->'disabled_permission_codes', '[]'::jsonb)
  ) disabled(permission_code);
end;
$$;

revoke execute on function public.get_contract_responsible_workspace(uuid, uuid)
  from public, anon;
grant execute on function public.get_contract_responsible_workspace(uuid, uuid)
  to authenticated;
revoke execute on function public.replace_contract_responsible_access(uuid, uuid, jsonb)
  from public, anon;
grant execute on function public.replace_contract_responsible_access(uuid, uuid, jsonb)
  to authenticated;

-- Keep the existing payment RPC as the implementation, but expose a scoped
-- wrapper so contract-level deny overrides are enforced before posting money.
create or replace function public.record_contract_period_payment_scoped(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_customer_id uuid,
  p_period_start date,
  p_period_end date,
  p_due_date date,
  p_amount numeric,
  p_currency_code text,
  p_received_at timestamptz,
  p_payment_method public.customer_payment_method,
  p_reference text,
  p_note text,
  p_allocations jsonb
)
returns table (
  payment_id uuid,
  allocated_amount numeric,
  unapplied_amount numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:record-payment')
  then
    raise exception 'Contract payment permission required' using errcode = '42501';
  end if;

  return query
  select *
  from public.record_contract_period_payment(
    p_tenant_id,
    p_contract_id,
    p_customer_id,
    p_period_start,
    p_period_end,
    p_due_date,
    p_amount,
    p_currency_code,
    p_received_at,
    p_payment_method,
    p_reference,
    p_note,
    p_allocations
  );
end;
$$;

revoke execute on function public.record_contract_period_payment_scoped(
  uuid, uuid, uuid, date, date, date, numeric, text, timestamptz,
  public.customer_payment_method, text, text, jsonb
) from public, anon;
grant execute on function public.record_contract_period_payment_scoped(
  uuid, uuid, uuid, date, date, date, numeric, text, timestamptz,
  public.customer_payment_method, text, text, jsonb
) to authenticated;

create or replace function public.list_contract_receivable_periods_scoped(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_sort text default 'periodStart_desc',
  p_status text default null,
  p_due_soon_days integer default 7
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  return public.list_contract_receivable_periods(
    p_tenant_id,
    p_contract_id,
    p_page,
    p_page_size,
    p_search,
    p_status,
    p_sort,
    p_due_soon_days
  );
end;
$$;

revoke execute on function public.list_contract_receivable_periods(
  uuid, uuid, integer, integer, text, text, text, integer
) from authenticated;
revoke execute on function public.list_contract_receivable_periods_scoped(
  uuid, uuid, integer, integer, text, text, text, integer
) from public, anon;
grant execute on function public.list_contract_receivable_periods_scoped(
  uuid, uuid, integer, integer, text, text, text, integer
) to authenticated;
