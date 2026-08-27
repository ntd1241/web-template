create or replace function public.get_contract_statistics(
  p_tenant_id uuid,
  p_responsible_employee_id uuid default null,
  p_expiring_within_days integer default 30
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_expiring_within_days integer := greatest(coalesce(p_expiring_within_days, 30), 0);
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  with scoped_contracts as (
    select contract.status, contract.end_date
    from public.contracts contract
    where contract.tenant_id = p_tenant_id
      and (
        p_responsible_employee_id is null
        or exists (
          select 1
          from public.contract_responsibles responsible
          where responsible.tenant_id = p_tenant_id
            and responsible.contract_id = contract.id
            and responsible.employee_id = p_responsible_employee_id
        )
      )
  )
  select jsonb_build_object(
    'total', count(*),
    'active', count(*) filter (
      where status = 'active'
        and not (
          end_date is not null
          and end_date between current_date and current_date + v_expiring_within_days
        )
    ),
    'expiring', count(*) filter (
      where status = 'active'
        and end_date between current_date and current_date + v_expiring_within_days
    ),
    'expired', count(*) filter (where status = 'expired')
  )
  into v_result
  from scoped_contracts;

  return v_result;
end;
$$;

revoke execute on function public.get_contract_statistics(uuid, uuid, integer)
  from public, anon;
grant execute on function public.get_contract_statistics(uuid, uuid, integer)
  to authenticated;

create index if not exists contract_responsibles_tenant_employee_contract_idx
  on public.contract_responsibles(tenant_id, employee_id, contract_id);

notify pgrst, 'reload schema';
