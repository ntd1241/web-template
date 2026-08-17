-- Generate recurring contract charges by schedule occurrence instead of by the
-- current through-date. Payment settlement can explicitly ensure the next
-- occurrence for the same recurring line.

update public.tenants
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{chargeGenerationLeadDays}',
  '0'::jsonb,
  true
)
where not (coalesce(settings, '{}'::jsonb) ? 'chargeGenerationLeadDays');

-- The original constraint included period_end. That allowed the same logical
-- occurrence to be inserted again when the daily horizon moved forward.
alter table public.contract_charges
  drop constraint if exists contract_charges_unique_period;

-- Repair duplicate open occurrences created by the old daily-horizon logic.
-- Existing payment allocations make an automatic repair unsafe, so fail the
-- migration and require an explicit accounting decision for those records.
do $$
declare
  v_group record;
  v_source record;
  v_cycle_months integer;
  v_schedule_end date;
  v_period_end date;
begin
  if exists (
    select 1
    from public.contract_charges charge
    where charge.status <> 'voided'
      and exists (
        select 1
        from public.customer_payment_allocations allocation
        where allocation.charge_id = charge.id
      )
      and exists (
        select 1
        from public.contract_charges duplicate_charge
        where duplicate_charge.status <> 'voided'
          and duplicate_charge.contract_version_line_id = charge.contract_version_line_id
          and duplicate_charge.period_start = charge.period_start
          and duplicate_charge.id <> charge.id
      )
  ) then
    raise exception
      'Cannot repair duplicate contract charges with payment allocations automatically';
  end if;

  for v_group in
    select
      charge.contract_version_line_id,
      charge.period_start,
      contract.end_date as contract_end_date,
      version.effective_to,
      line.end_date as line_end_date,
      line.billing_unit,
      line.billing_interval
    from public.contract_charges charge
    join public.contract_version_lines line
      on line.id = charge.contract_version_line_id
    join public.contract_versions version
      on version.id = charge.contract_version_id
    join public.contracts contract
      on contract.id = charge.contract_id
    where charge.status <> 'voided'
    group by
      charge.contract_version_line_id,
      charge.period_start,
      contract.end_date,
      version.effective_to,
      line.end_date,
      line.billing_unit,
      line.billing_interval
    having count(*) > 1
  loop
    v_cycle_months := case v_group.billing_unit
      when 'month' then v_group.billing_interval
      when 'quarter' then v_group.billing_interval * 3
      when 'year' then v_group.billing_interval * 12
    end;

    if v_cycle_months is null or v_cycle_months <= 0 then
      raise exception 'Cannot repair duplicate charge with invalid billing interval for line %',
        v_group.contract_version_line_id;
    end if;

    select charge.*
    into v_source
    from public.contract_charges charge
    where charge.contract_version_line_id = v_group.contract_version_line_id
      and charge.period_start = v_group.period_start
      and charge.status <> 'voided'
    order by charge.created_at desc, charge.id desc
    limit 1;

    update public.contract_charges
    set status = 'voided',
        void_reason = 'Sửa kỳ trùng do lỗi sinh kỳ theo horizon ngày.'
    where contract_version_line_id = v_group.contract_version_line_id
      and period_start = v_group.period_start
      and status <> 'voided';

    v_schedule_end := least(
      v_group.contract_end_date,
      v_group.effective_to,
      v_group.line_end_date
    );
    v_period_end := (
      v_group.period_start
      + make_interval(months => v_cycle_months)
      - interval '1 day'
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
      currency_code,
      status
    )
    values (
      v_source.tenant_id,
      v_source.customer_id,
      v_source.contract_id,
      v_source.contract_version_id,
      v_source.contract_version_line_id,
      v_source.period_start,
      v_period_end,
      public.contract_calculate_due_date(
        v_source.period_start,
        v_period_end,
        (select line.due_rule from public.contract_version_lines line where line.id = v_source.contract_version_line_id),
        (select line.due_days from public.contract_version_lines line where line.id = v_source.contract_version_line_id)
      ),
      v_source.amount,
      v_source.currency_code,
      'open'
    );
  end loop;
end;
$$;

create unique index contract_charges_unique_occurrence
  on public.contract_charges(contract_version_line_id, period_start)
  where status <> 'voided';

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

  if not found or v_charge.status <> 'paid' or v_charge.billing_type <> 'recurring' then
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
      and contract.status <> 'draft'
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

create or replace function public.record_customer_payment(
  p_tenant_id uuid,
  p_customer_id uuid,
  p_amount numeric,
  p_currency_code text,
  p_received_at timestamptz,
  p_payment_method public.customer_payment_method,
  p_reference text default '',
  p_note text default ''
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
declare
  v_payment_id uuid;
  v_remaining numeric(18, 2) := round(p_amount, 2);
  v_allocated numeric(18, 2) := 0;
  v_charge record;
  v_paid_charge record;
  v_to_allocate numeric(18, 2);
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero' using errcode = '22003';
  end if;

  if p_currency_code is null or p_currency_code !~ '^[A-Z]{3}$' then
    raise exception 'Invalid currency code' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.customers customer
    where customer.id = p_customer_id
      and customer.tenant_id = p_tenant_id
  ) then
    raise exception 'Customer does not belong to tenant' using errcode = '42501';
  end if;

  if auth.uid() is not null
    and not public.has_tenant_permission(
      p_tenant_id,
      'contracts:record-payment'
    ) then
    raise exception 'Payment permission required' using errcode = '42501';
  end if;

  perform public.ensure_contract_charges(
    p_tenant_id,
    coalesce(p_received_at, timezone('utc', now()))::date
  );

  insert into public.customer_payments (
    tenant_id,
    customer_id,
    received_at,
    amount,
    currency_code,
    payment_method,
    reference,
    note,
    created_by
  )
  values (
    p_tenant_id,
    p_customer_id,
    coalesce(p_received_at, timezone('utc', now())),
    round(p_amount, 2),
    p_currency_code,
    p_payment_method,
    coalesce(btrim(p_reference), ''),
    coalesce(btrim(p_note), ''),
    auth.uid()
  )
  returning id into v_payment_id;

  for v_charge in
    select
      charge.id,
      balances.outstanding_amount,
      charge.due_date,
      charge.period_start
    from public.contract_charges charge
    join public.contract_version_lines line
      on line.id = charge.contract_version_line_id
    join (
      select
        balance_charge.id as charge_id,
        greatest(
          balance_charge.amount - coalesce(sum(
            case when balance_payment.status = 'posted'
              then balance_allocation.allocated_amount
              else 0
            end
          ), 0),
          0
        )::numeric(18, 2) as outstanding_amount
      from public.contract_charges balance_charge
      left join public.customer_payment_allocations balance_allocation
        on balance_allocation.charge_id = balance_charge.id
      left join public.customer_payments balance_payment
        on balance_payment.id = balance_allocation.payment_id
      where balance_charge.tenant_id = p_tenant_id
        and balance_charge.customer_id = p_customer_id
        and balance_charge.currency_code = p_currency_code
        and balance_charge.status <> 'voided'
      group by balance_charge.id, balance_charge.amount
      having balance_charge.amount - coalesce(sum(
        case when balance_payment.status = 'posted'
          then balance_allocation.allocated_amount
          else 0
        end
      ), 0) > 0
    ) balances
      on balances.charge_id = charge.id
    where charge.tenant_id = p_tenant_id
      and charge.customer_id = p_customer_id
      and charge.currency_code = p_currency_code
      and charge.status <> 'voided'
      and line.direction = 'receivable'
    order by
      (charge.due_date < coalesce(p_received_at::date, current_date)) desc,
      charge.due_date asc,
      charge.period_start asc,
      charge.id
    for update of charge
  loop
    exit when v_remaining <= 0;
    v_to_allocate := least(v_remaining, v_charge.outstanding_amount);

    insert into public.customer_payment_allocations (
      payment_id,
      charge_id,
      allocated_amount
    )
    values (v_payment_id, v_charge.id, v_to_allocate);

    v_remaining := v_remaining - v_to_allocate;
    v_allocated := v_allocated + v_to_allocate;
  end loop;

  for v_paid_charge in
    update public.contract_charges charge
    set status = case
      when charge.status = 'voided' then 'voided'::public.contract_charge_status
      when balances.paid_amount >= charge.amount then 'paid'::public.contract_charge_status
      when balances.paid_amount > 0 then 'partially_paid'::public.contract_charge_status
      else 'open'::public.contract_charge_status
    end
    from (
      select
        allocation.charge_id,
        sum(case when payment.status = 'posted' then allocation.allocated_amount else 0 end)
          as paid_amount
      from public.customer_payment_allocations allocation
      join public.customer_payments payment on payment.id = allocation.payment_id
      where allocation.charge_id in (
        select payment_allocation.charge_id
        from public.customer_payment_allocations payment_allocation
        where payment_allocation.payment_id = v_payment_id
      )
      group by allocation.charge_id
    ) balances
    where charge.id = balances.charge_id
    returning charge.id, charge.status
  loop
    if v_paid_charge.status = 'paid' then
      perform public.ensure_next_contract_charge(v_paid_charge.id);
    end if;
  end loop;

  return query
  select v_payment_id, v_allocated, v_remaining;
end;
$$;

revoke execute on function public.ensure_next_contract_charge(uuid) from public, anon;
revoke execute on function public.ensure_contract_charges(uuid, date) from public, anon;
grant execute on function public.ensure_contract_charges(uuid, date) to authenticated;
revoke execute on function public.record_customer_payment(
  uuid, uuid, numeric, text, timestamptz, public.customer_payment_method, text, text
) from public, anon;
grant execute on function public.record_customer_payment(
  uuid, uuid, numeric, text, timestamptz, public.customer_payment_method, text, text
) to authenticated;
