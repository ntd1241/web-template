-- Closed contracts keep their existing charges and receivables, but must not
-- create new recurring periods. This applies to both the daily/horizon ensure
-- path and the payment-completion path.

create or replace function public.ensure_next_contract_charge(
  p_charge_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_charge record;
  v_cycle_months integer;
  v_schedule_end date;
  v_next_period_start date;
  v_period_end date;
  v_inserted integer;
begin
  select
    charge.id,
    charge.status,
    charge.tenant_id,
    charge.customer_id,
    charge.contract_id,
    charge.contract_version_id,
    charge.contract_version_line_id,
    charge.period_start,
    charge.amount,
    charge.currency_code,
    line.billing_type,
    line.billing_unit,
    line.billing_interval,
    line.due_rule,
    line.due_days,
    contract.status as contract_status,
    contract.end_date as contract_end_date,
    version.effective_to,
    line.end_date as line_end_date
  into v_charge
  from public.contract_charges charge
  join public.contract_version_lines line
    on line.id = charge.contract_version_line_id
  join public.contract_versions version
    on version.id = charge.contract_version_id
  join public.contracts contract
    on contract.id = charge.contract_id
  where charge.id = p_charge_id;

  if not found
    or v_charge.status <> 'paid'
    or v_charge.billing_type <> 'recurring'
    or v_charge.contract_status in ('expired', 'terminated')
  then
    return 0;
  end if;

  v_cycle_months := case v_charge.billing_unit
    when 'month' then v_charge.billing_interval
    when 'quarter' then v_charge.billing_interval * 3
    when 'year' then v_charge.billing_interval * 12
  end;

  if v_cycle_months is null or v_cycle_months <= 0 then
    raise exception 'Invalid billing interval for contract charge %', p_charge_id;
  end if;

  v_next_period_start := (
    v_charge.period_start + make_interval(months => v_cycle_months)
  )::date;
  v_schedule_end := least(
    v_charge.contract_end_date,
    v_charge.effective_to,
    v_charge.line_end_date
  );

  if v_schedule_end is not null and v_next_period_start > v_schedule_end then
    return 0;
  end if;

  if exists (
    select 1
    from public.contract_charges existing
    where existing.contract_version_line_id = v_charge.contract_version_line_id
      and existing.period_start = v_next_period_start
  ) then
    return 0;
  end if;

  v_period_end := (
    v_next_period_start + make_interval(months => v_cycle_months) - interval '1 day'
  )::date;
  if v_schedule_end is not null then
    v_period_end := least(v_period_end, v_schedule_end);
  end if;

  insert into public.contract_charges (
    tenant_id,
    customer_id,
    contract_id,
    contract_version_id,
    contract_version_line_id,
    period_start,
    period_end,
    due_date,
    amount,
    currency_code
  )
  values (
    v_charge.tenant_id,
    v_charge.customer_id,
    v_charge.contract_id,
    v_charge.contract_version_id,
    v_charge.contract_version_line_id,
    v_next_period_start,
    v_period_end,
    public.contract_calculate_due_date(
      v_next_period_start,
      v_period_end,
      v_charge.due_rule,
      v_charge.due_days
    ),
    v_charge.amount,
    v_charge.currency_code
  )
  on conflict (contract_version_line_id, period_start) where status <> 'voided' do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;

create or replace function public.ensure_contract_charges(
  p_tenant_id uuid,
  p_through_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_period_start date;
  v_period_end date;
  v_anchor date;
  v_upper date;
  v_schedule_end date;
  v_generation_until date;
  v_cycle_months integer;
  v_lead_days integer := 0;
  v_inserted integer;
  v_total_inserted integer := 0;
begin
  if p_through_date is null then
    raise exception 'through_date is required' using errcode = '22004';
  end if;

  select case
    when jsonb_typeof(tenant.settings -> 'chargeGenerationLeadDays') = 'number'
      and (tenant.settings ->> 'chargeGenerationLeadDays') ~ '^[0-9]+$'
    then least((tenant.settings ->> 'chargeGenerationLeadDays')::integer, 365)
    else 0
  end
  into v_lead_days
  from public.tenants tenant
  where tenant.id = p_tenant_id;

  v_generation_until := p_through_date + coalesce(v_lead_days, 0);

  for v_contract in
    select
      contract.id as contract_id,
      contract.tenant_id,
      contract.customer_id,
      contract.currency_code,
      contract.start_date as contract_start_date,
      contract.end_date as contract_end_date,
      version.id as contract_version_id,
      version.effective_from,
      version.effective_to,
      line.id as contract_version_line_id,
      line.amount,
      line.billing_type,
      line.billing_unit,
      line.billing_interval,
      line.charge_date,
      line.due_rule,
      line.due_days,
      line.start_date as line_start_date,
      line.end_date as line_end_date
    from public.contracts contract
    join public.contract_versions version
      on version.contract_id = contract.id
    join public.contract_version_lines line
      on line.contract_version_id = version.id
    where contract.tenant_id = p_tenant_id
      and contract.status not in ('draft', 'expired', 'terminated')
      and version.status in ('effective', 'superseded')
      and version.effective_from <= v_generation_until
      and (version.effective_to is null or version.effective_to >= version.effective_from)
  loop
    if v_contract.billing_type = 'one_time' then
      if v_contract.charge_date <= v_generation_until
        and v_contract.charge_date >= v_contract.effective_from
        and (v_contract.effective_to is null or v_contract.charge_date <= v_contract.effective_to)
      then
        if not exists (
          select 1
          from public.contract_charges existing
          where existing.contract_version_line_id = v_contract.contract_version_line_id
            and existing.period_start = v_contract.charge_date
        ) then
          insert into public.contract_charges (
            tenant_id,
            customer_id,
            contract_id,
            contract_version_id,
            contract_version_line_id,
            period_start,
            period_end,
            due_date,
            amount,
            currency_code
          )
          values (
            v_contract.tenant_id,
            v_contract.customer_id,
            v_contract.contract_id,
            v_contract.contract_version_id,
            v_contract.contract_version_line_id,
            v_contract.charge_date,
            v_contract.charge_date,
            public.contract_calculate_due_date(
              v_contract.charge_date,
              v_contract.charge_date,
              v_contract.due_rule,
              v_contract.due_days
            ),
            v_contract.amount,
            v_contract.currency_code
          )
          on conflict (contract_version_line_id, period_start) where status <> 'voided' do nothing;

          get diagnostics v_inserted = row_count;
          v_total_inserted := v_total_inserted + v_inserted;
        end if;
      end if;
    else
      v_cycle_months := case v_contract.billing_unit
        when 'month' then v_contract.billing_interval
        when 'quarter' then v_contract.billing_interval * 3
        when 'year' then v_contract.billing_interval * 12
      end;

      if v_cycle_months is null or v_cycle_months <= 0 then
        raise exception 'Invalid billing interval for contract version line %',
          v_contract.contract_version_line_id;
      end if;

      v_anchor := greatest(
        v_contract.contract_start_date,
        v_contract.effective_from,
        v_contract.line_start_date
      );
      v_schedule_end := least(
        v_contract.contract_end_date,
        v_contract.effective_to,
        v_contract.line_end_date
      );
      v_upper := case
        when v_schedule_end is null then v_generation_until
        else least(v_generation_until, v_schedule_end)
      end;

      if v_anchor <= v_upper then
        for v_period_start in
          select generated_period::date
          from generate_series(
            v_anchor,
            v_upper,
            make_interval(months => v_cycle_months)
          ) as generated_period
        loop
          if not exists (
            select 1
            from public.contract_charges existing
            where existing.contract_version_line_id = v_contract.contract_version_line_id
              and existing.period_start = v_period_start
          ) then
            v_period_end := (
              v_period_start + make_interval(months => v_cycle_months) - interval '1 day'
            )::date;
            if v_schedule_end is not null then
              v_period_end := least(v_period_end, v_schedule_end);
            end if;

            insert into public.contract_charges (
              tenant_id,
              customer_id,
              contract_id,
              contract_version_id,
              contract_version_line_id,
              period_start,
              period_end,
              due_date,
              amount,
              currency_code
            )
            values (
              v_contract.tenant_id,
              v_contract.customer_id,
              v_contract.contract_id,
              v_contract.contract_version_id,
              v_contract.contract_version_line_id,
              v_period_start,
              v_period_end,
              public.contract_calculate_due_date(
                v_period_start,
                v_period_end,
                v_contract.due_rule,
                v_contract.due_days
              ),
              v_contract.amount,
              v_contract.currency_code
            )
            on conflict (contract_version_line_id, period_start) where status <> 'voided' do nothing;

            get diagnostics v_inserted = row_count;
            v_total_inserted := v_total_inserted + v_inserted;
          end if;
        end loop;
      end if;
    end if;
  end loop;

  return v_total_inserted;
end;
$$;
