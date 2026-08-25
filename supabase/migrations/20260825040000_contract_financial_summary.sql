-- Financial summary for the contract detail page.
--
-- Persisted charges remain the source of truth for actual receivables and
-- payments. For contracts with a fixed end date, the headline total is
-- calculated from the published version timeline so that future periods do
-- not need to be materialized as contract_charges first.
create or replace function public.get_contract_financial_summary(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_as_of_date date default current_date
)
returns jsonb
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  v_contract public.contracts%rowtype;
  v_total_contract_value numeric(18, 2) := null;
  v_total_incurred numeric(18, 2) := 0;
  v_total_paid numeric(18, 2) := 0;
  v_total_outstanding numeric(18, 2) := 0;
  v_overdue_outstanding numeric(18, 2) := 0;
  v_progress_base text;
  v_progress_denominator numeric(18, 2);
  v_progress_percent numeric(7, 2);
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  if p_as_of_date is null then
    raise exception 'as_of_date is required' using errcode = '22004';
  end if;

  select contract.*
  into v_contract
  from public.contracts contract
  where contract.tenant_id = p_tenant_id
    and contract.id = p_contract_id;

  if not found then
    raise exception 'Contract not found' using errcode = 'P0002';
  end if;

  select
    coalesce(sum(balance.amount), 0)::numeric(18, 2),
    coalesce(sum(balance.paid_amount), 0)::numeric(18, 2),
    coalesce(
      sum(balance.outstanding_amount)
        filter (where balance.outstanding_amount > 0 and balance.due_date <= p_as_of_date),
      0
    )::numeric(18, 2),
    coalesce(
      sum(balance.outstanding_amount)
        filter (where balance.outstanding_amount > 0 and balance.due_date < p_as_of_date),
      0
    )::numeric(18, 2)
  into
    v_total_incurred,
    v_total_paid,
    v_total_outstanding,
    v_overdue_outstanding
  from public.contract_charge_balances balance
  where balance.tenant_id = p_tenant_id
    and balance.contract_id = p_contract_id
    and balance.direction = 'receivable'
    and balance.status <> 'voided';

  if v_contract.end_date is not null then
    with source_lines as (
      select
        greatest(contract.start_date, version.effective_from, line.start_date) as schedule_start,
        least(contract.end_date, version.effective_to, line.end_date) as schedule_end,
        line.amount,
        line.billing_type,
        line.billing_unit,
        line.billing_interval,
        line.charge_date
      from public.contracts contract
      join public.contract_versions version
        on version.contract_id = contract.id
      join public.contract_version_lines line
        on line.contract_version_id = version.id
      where contract.tenant_id = p_tenant_id
        and contract.id = p_contract_id
        and version.status in ('effective', 'superseded')
        and line.direction = 'receivable'
    ), occurrences as (
      select source.amount
      from source_lines source
      where source.billing_type = 'one_time'
        and source.schedule_start <= source.schedule_end
        and source.charge_date between source.schedule_start and source.schedule_end

      union all

      select source.amount
      from source_lines source
      cross join lateral generate_series(
        source.schedule_start,
        source.schedule_end,
        make_interval(months => source.billing_interval * case source.billing_unit
          when 'month' then 1
          when 'quarter' then 3
          when 'year' then 12
        end)
      ) as generated_period
      where source.billing_type = 'recurring'
        and source.billing_interval is not null
        and source.billing_interval > 0
        and source.billing_unit is not null
        and source.schedule_start <= source.schedule_end
    )
    select coalesce(sum(occurrence.amount), 0)::numeric(18, 2)
    into v_total_contract_value
    from occurrences occurrence;
  end if;

  if v_total_contract_value is not null then
    v_progress_base := 'contract_value';
    v_progress_denominator := v_total_contract_value;
  else
    v_progress_base := 'incurred';
    v_progress_denominator := v_total_incurred;
  end if;

  v_progress_percent := case
    when v_progress_denominator > 0 then least(
      100,
      greatest(0, round(v_total_paid / v_progress_denominator * 100, 2))
    )
    else 0
  end;

  return jsonb_build_object(
    'total_contract_value', v_total_contract_value,
    'total_incurred', v_total_incurred,
    'total_paid', v_total_paid,
    'total_outstanding', v_total_outstanding,
    'overdue_outstanding', v_overdue_outstanding,
    'progress_base', v_progress_base,
    'progress_percent', v_progress_percent
  );
end;
$$;

revoke execute on function public.get_contract_financial_summary(uuid, uuid, date)
from public, anon;
grant execute on function public.get_contract_financial_summary(uuid, uuid, date)
to authenticated;
