-- Contract-level payments are allocated by month in the UI. The database then
-- allocates each month to its persisted charges by line priority and keeps any
-- remaining amount as contract-scoped unapplied credit.

alter table public.customer_payments
  add column if not exists contract_id uuid references public.contracts(id) on delete restrict,
  add column if not exists unapplied_amount numeric(18, 2) not null default 0;

update public.customer_payments
set unapplied_amount = 0
where unapplied_amount is null;

alter table public.customer_payments
  alter column unapplied_amount set not null;

alter table public.customer_payments
  drop constraint if exists customer_payments_unapplied_amount_check;

alter table public.customer_payments
  add constraint customer_payments_unapplied_amount_check
  check (unapplied_amount >= 0 and unapplied_amount <= amount);

create index if not exists customer_payments_contract_received_idx
  on public.customer_payments(contract_id, currency_code, received_at desc)
  where contract_id is not null;

create or replace function public.list_contract_payment_candidates(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_scope text default 'contract',
  p_scope_start date default null,
  p_scope_end date default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_scope text := coalesce(nullif(btrim(p_scope), ''), 'contract');
  v_future_until date := (current_date + interval '120 months')::date;
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  if v_scope not in ('month', 'contract') then
    raise exception 'Invalid contract payment scope' using errcode = '22023';
  end if;

  if v_scope = 'month'
    and (p_scope_start is null or p_scope_end is null or p_scope_end < p_scope_start)
  then
    raise exception 'A valid month scope is required' using errcode = '22023';
  end if;

  with source_lines as (
    select
      contract.id as contract_id,
      contract.tenant_id,
      contract.customer_id,
      contract.currency_code,
      version.id as contract_version_id,
      line.id as contract_version_line_id,
      line.name as fee_name,
      line.sort_order,
      line.direction,
      line.amount,
      line.billing_type,
      line.billing_unit,
      line.billing_interval,
      line.charge_date,
      line.due_rule,
      line.due_days,
      greatest(contract.start_date, version.effective_from, line.start_date) as schedule_start,
      least(contract.end_date, version.effective_to, line.end_date) as schedule_end
    from public.contracts contract
    join public.contract_versions version
      on version.contract_id = contract.id
    join public.contract_version_lines line
      on line.contract_version_id = version.id
    where v_scope = 'contract'
      and contract.tenant_id = p_tenant_id
      and contract.id = p_contract_id
      and contract.status not in ('draft', 'expired', 'terminated')
      and version.status = 'effective'
  ), scope_balances as (
    select
      balance.id as charge_id,
      line.name as fee_name,
      balance.period_start,
      balance.period_end,
      balance.due_date,
      balance.amount,
      balance.paid_amount,
      balance.outstanding_amount,
      balance.currency_code,
      line.sort_order
    from public.contract_charge_balances balance
    join public.contract_version_lines line
      on line.id = balance.contract_version_line_id
    where balance.tenant_id = p_tenant_id
      and balance.contract_id = p_contract_id
      and balance.direction = 'receivable'
      and balance.status <> 'voided'
      and (
        v_scope = 'contract'
        or (
          balance.period_start >= p_scope_start
          and balance.period_start <= p_scope_end
        )
      )
  ), future_recurring_schedule as (
    select
      'future:' || source.contract_version_line_id::text || ':' || generated.period_start::text as charge_id,
      source.fee_name,
      generated.period_start,
      least(
        (
          generated.period_start
          + make_interval(months => source.billing_interval * case source.billing_unit
              when 'month' then 1
              when 'quarter' then 3
              when 'year' then 12
            end)
          - interval '1 day'
        )::date,
        coalesce(source.schedule_end, v_future_until)
      ) as period_end,
      source.due_rule,
      source.due_days,
      source.amount,
      source.currency_code,
      source.contract_version_line_id,
      source.sort_order
    from source_lines source
    cross join lateral (
      select generated_period::date as period_start
      from generate_series(
        source.schedule_start,
        least(coalesce(source.schedule_end, v_future_until), v_future_until),
        make_interval(months => source.billing_interval * case source.billing_unit
          when 'month' then 1
          when 'quarter' then 3
          when 'year' then 12
        end)
      ) as generated_period
    ) generated
    where source.billing_type = 'recurring'
      and source.direction = 'receivable'
      and source.billing_interval is not null
      and source.billing_interval > 0
      and not exists (
        select 1
        from public.contract_charges existing
        where existing.contract_version_line_id = source.contract_version_line_id
          and existing.period_start = generated.period_start
      )
  ), future_one_time_schedule as (
    select
      'future:' || source.contract_version_line_id::text || ':' || source.charge_date::text as charge_id,
      source.fee_name,
      source.charge_date as period_start,
      source.charge_date as period_end,
      source.due_rule,
      source.due_days,
      source.amount,
      source.currency_code,
      source.contract_version_line_id,
      source.sort_order
    from source_lines source
    where source.billing_type = 'one_time'
      and source.direction = 'receivable'
      and source.charge_date > current_date
      and source.charge_date <= v_future_until
      and not exists (
        select 1
        from public.contract_charges existing
        where existing.contract_version_line_id = source.contract_version_line_id
          and existing.period_start = source.charge_date
      )
  ), future_rows as (
    select
      schedule.charge_id,
      schedule.fee_name,
      schedule.period_start,
      schedule.period_end,
      public.contract_calculate_due_date(
        schedule.period_start,
        schedule.period_end,
        schedule.due_rule,
        schedule.due_days
      ) as due_date,
      schedule.amount,
      0::numeric(18, 2) as paid_amount,
      schedule.amount::numeric(18, 2) as outstanding_amount,
      schedule.currency_code,
      schedule.sort_order
    from (
      select * from future_recurring_schedule
      union all
      select * from future_one_time_schedule
    ) schedule
  ), future_candidates as (
    select *
    from future_rows
    where due_date > current_date
  ), month_source as (
    select
      balance.period_start,
      balance.period_end,
      balance.due_date,
      balance.amount,
      balance.paid_amount,
      balance.outstanding_amount
    from scope_balances balance
    union all
    select
      future.period_start,
      future.period_end,
      future.due_date,
      future.amount,
      future.paid_amount,
      future.outstanding_amount
    from future_candidates future
  ), candidates as (
    select *
    from scope_balances
    where outstanding_amount > 0
  ), contract_months as (
    select
      date_trunc('month', candidate.period_start)::date as month_start,
      (date_trunc('month', candidate.period_start) + interval '1 month - 1 day')::date as month_end,
      sum(candidate.amount)::numeric(18, 2) as amount,
      sum(candidate.paid_amount)::numeric(18, 2) as paid_amount,
      sum(candidate.outstanding_amount)::numeric(18, 2) as outstanding_amount,
      sum(
        case
          when candidate.due_date <= current_date then candidate.outstanding_amount
          else 0
        end
      )::numeric(18, 2) as due_outstanding_amount,
      bool_or(
        candidate.due_date <= current_date
        and candidate.outstanding_amount > 0
      ) as is_due
    from month_source candidate
    group by date_trunc('month', candidate.period_start)
    having sum(candidate.outstanding_amount) > 0
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'charge_id', candidate.charge_id,
            'fee_name', candidate.fee_name,
            'period_start', candidate.period_start,
            'period_end', candidate.period_end,
            'due_date', candidate.due_date,
            'amount', candidate.amount,
            'paid_amount', candidate.paid_amount,
            'outstanding_amount', candidate.outstanding_amount,
            'currency_code', candidate.currency_code
          )
          order by
            candidate.period_start asc,
            candidate.period_end asc,
            candidate.due_date asc,
            candidate.sort_order asc,
            candidate.charge_id asc
        )
        from candidates candidate
      ),
      '[]'::jsonb
    ),
    'total', (select count(*) from candidates),
    'total_amount', coalesce((select sum(scope_balance.amount) from scope_balances scope_balance), 0),
    'paid_amount', coalesce((select sum(scope_balance.paid_amount) from scope_balances scope_balance), 0),
    'outstanding_amount', coalesce((select sum(candidate.outstanding_amount) from candidates candidate), 0),
    'unapplied_credit', coalesce(
      (
        select sum(payment.unapplied_amount)
        from public.customer_payments payment
        where payment.tenant_id = p_tenant_id
          and payment.contract_id = p_contract_id
          and payment.currency_code = (
            select contract.currency_code
            from public.contracts contract
            where contract.id = p_contract_id
              and contract.tenant_id = p_tenant_id
          )
          and payment.status = 'posted'
          and payment.unapplied_amount > 0
      ),
      0
    ),
    'months', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'month_start', month.month_start,
            'month_end', month.month_end,
            'amount', month.amount,
            'paid_amount', month.paid_amount,
            'outstanding_amount', month.outstanding_amount,
            'due_outstanding_amount', month.due_outstanding_amount,
            'is_due', month.is_due
          )
          order by month.month_start asc
        )
        from contract_months month
        where v_scope = 'contract'
      ),
      '[]'::jsonb
    )
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.record_contract_payment(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_customer_id uuid,
  p_currency_code text,
  p_amount numeric,
  p_received_at timestamptz,
  p_payment_method public.customer_payment_method,
  p_reference text,
  p_note text,
  p_allocations jsonb,
  p_scope text default 'contract',
  p_scope_start date default null,
  p_scope_end date default null
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
  v_scope text := coalesce(nullif(btrim(p_scope), ''), 'contract');
  v_payment_id uuid;
  v_amount numeric(18, 2) := round(p_amount, 2);
  v_total_allocated numeric(18, 2) := 0;
  v_scope_outstanding numeric(18, 2);
  v_allocation_count integer;
  v_unique_allocation_count integer;
  v_target_charge_count integer;
  v_allocation record;
  v_month record;
  v_charge record;
  v_outstanding numeric(18, 2);
  v_month_remaining numeric(18, 2);
  v_max_month_start date;
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:record-payment')
  then
    raise exception 'Contract payment permission required' using errcode = '42501';
  end if;

  if v_scope not in ('month', 'contract') then
    raise exception 'Invalid contract payment scope' using errcode = '22023';
  end if;

  if v_scope = 'month'
    and (p_scope_start is null or p_scope_end is null or p_scope_end < p_scope_start)
  then
    raise exception 'A valid month scope is required' using errcode = '22023';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Payment amount must be greater than zero' using errcode = '22003';
  end if;

  if p_currency_code is null or p_currency_code !~ '^[A-Z]{3}$' then
    raise exception 'Invalid currency code' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.contracts contract
    where contract.id = p_contract_id
      and contract.tenant_id = p_tenant_id
      and contract.customer_id = p_customer_id
      and contract.currency_code = p_currency_code
  ) then
    raise exception 'Contract does not belong to the customer and tenant' using errcode = '42501';
  end if;

  if p_allocations is null or jsonb_typeof(p_allocations) <> 'array' then
    raise exception 'Payment allocations are required' using errcode = '22023';
  end if;

  if v_scope = 'contract' then
    select max(allocation.month_start)
    into v_max_month_start
    from jsonb_to_recordset(p_allocations) as allocation(
      month_start date,
      allocated_amount numeric
    );

    if v_max_month_start > current_date then
      -- Prepaid months are materialized only when the user actually assigns
      -- money to them. This keeps the daily charge job finite while allowing
      -- a contract payment to remain fully traceable to real charges.
      perform public.ensure_contract_charges(
        p_tenant_id,
        (v_max_month_start + interval '1 month - 1 day')::date
      );
    end if;
  end if;

  insert into public.customer_payments (
    tenant_id,
    customer_id,
    contract_id,
    received_at,
    amount,
    currency_code,
    payment_method,
    reference,
    note,
    unapplied_amount,
    created_by
  )
  values (
    p_tenant_id,
    p_customer_id,
    p_contract_id,
    coalesce(p_received_at, timezone('utc', now())),
    v_amount,
    p_currency_code,
    p_payment_method,
    coalesce(btrim(p_reference), ''),
    coalesce(btrim(p_note), ''),
    0,
    auth.uid()
  )
  returning id into v_payment_id;

  if v_scope = 'contract' then
    if exists (
      select 1
      from jsonb_to_recordset(p_allocations) as allocation(
        month_start date,
        allocated_amount numeric
      )
      where allocation.month_start is null
        or allocation.allocated_amount is null
        or allocation.allocated_amount <= 0
    ) then
      raise exception 'Monthly payment allocations must contain positive amounts' using errcode = '22023';
    end if;

    select
      count(*)::integer,
      count(distinct allocation.month_start)::integer,
      coalesce(sum(allocation.allocated_amount), 0)::numeric(18, 2)
    into
      v_allocation_count,
      v_unique_allocation_count,
      v_total_allocated
    from jsonb_to_recordset(p_allocations) as allocation(
      month_start date,
      allocated_amount numeric
    );

    if v_allocation_count <> v_unique_allocation_count then
      raise exception 'A month can only appear once in payment allocations' using errcode = '22023';
    end if;

    if v_total_allocated > v_amount then
      raise exception 'Monthly payment allocations exceed the payment amount' using errcode = '22003';
    end if;

    for v_month in
      select allocation.month_start, round(allocation.allocated_amount, 2) as allocated_amount
      from jsonb_array_elements(p_allocations) with ordinality as raw(value, priority)
      cross join lateral jsonb_to_record(raw.value) as allocation(
        month_start date,
        allocated_amount numeric
      )
      order by raw.priority asc
    loop
      v_month_remaining := v_month.allocated_amount;

      for v_charge in
        select charge.id, balance.outstanding_amount
        from public.contract_charges charge
        join public.contract_charge_balances balance
          on balance.id = charge.id
        join public.contract_version_lines line
          on line.id = charge.contract_version_line_id
        where charge.tenant_id = p_tenant_id
          and charge.customer_id = p_customer_id
          and charge.contract_id = p_contract_id
          and charge.currency_code = p_currency_code
          and line.direction = 'receivable'
          and balance.status <> 'voided'
          and balance.outstanding_amount > 0
          and date_trunc('month', charge.period_start)::date = v_month.month_start
        order by
          (charge.due_date <= current_date) desc,
          charge.due_date asc,
          line.sort_order asc,
          charge.period_start asc,
          charge.id asc
        for update of charge
      loop
        exit when v_month_remaining <= 0;
        v_outstanding := v_charge.outstanding_amount;

        insert into public.customer_payment_allocations (
          payment_id,
          charge_id,
          allocated_amount
        )
        values (
          v_payment_id,
          v_charge.id,
          least(v_month_remaining, v_outstanding)
        );

        v_month_remaining := v_month_remaining - least(v_month_remaining, v_outstanding);
      end loop;

      if v_month_remaining > 0 then
        raise exception 'Payment allocation exceeds the outstanding amount of a month' using errcode = '22003';
      end if;
    end loop;
  else
    if jsonb_array_length(p_allocations) = 0 then
      raise exception 'Payment allocations are required' using errcode = '22023';
    end if;

    select
      count(*)::integer,
      count(distinct allocation.charge_id)::integer,
      coalesce(sum(allocation.allocated_amount), 0)::numeric(18, 2)
    into
      v_allocation_count,
      v_unique_allocation_count,
      v_total_allocated
    from jsonb_to_recordset(p_allocations) as allocation(
      charge_id uuid,
      allocated_amount numeric
    );

    if v_allocation_count <> v_unique_allocation_count then
      raise exception 'A charge can only appear once in payment allocations' using errcode = '22023';
    end if;

    if exists (
      select 1
      from jsonb_to_recordset(p_allocations) as allocation(
        charge_id uuid,
        allocated_amount numeric
      )
      where allocation.charge_id is null
        or allocation.allocated_amount is null
        or allocation.allocated_amount <= 0
    ) then
      raise exception 'Payment allocations must contain positive amounts' using errcode = '22023';
    end if;

    if round(v_total_allocated, 2) <> v_amount then
      raise exception 'Payment allocations must equal the payment amount' using errcode = '22003';
    end if;

    select count(*)::integer
    into v_target_charge_count
    from public.contract_charge_balances balance
    where balance.id in (
      select allocation.charge_id
      from jsonb_to_recordset(p_allocations) as allocation(
        charge_id uuid,
        allocated_amount numeric
      )
    )
      and balance.tenant_id = p_tenant_id
      and balance.customer_id = p_customer_id
      and balance.contract_id = p_contract_id
      and balance.currency_code = p_currency_code
      and balance.direction = 'receivable'
      and balance.status <> 'voided'
      and balance.outstanding_amount > 0
      and balance.period_start >= p_scope_start
      and balance.period_start <= p_scope_end;

    if v_target_charge_count <> v_unique_allocation_count then
      raise exception 'Payment allocations contain a charge outside the selected scope' using errcode = '22023';
    end if;

    for v_charge in
      select charge.id
      from public.contract_charges charge
      join public.contract_version_lines line
        on line.id = charge.contract_version_line_id
      where charge.id in (
        select allocation.charge_id
        from jsonb_to_recordset(p_allocations) as allocation(
          charge_id uuid,
          allocated_amount numeric
        )
      )
        and charge.tenant_id = p_tenant_id
        and charge.customer_id = p_customer_id
        and charge.contract_id = p_contract_id
        and charge.currency_code = p_currency_code
        and line.direction = 'receivable'
        and charge.status <> 'voided'
      for update of charge
    loop
      null;
    end loop;

    for v_allocation in
      select allocation.charge_id, round(allocation.allocated_amount, 2) as allocated_amount
      from jsonb_to_recordset(p_allocations) as allocation(
        charge_id uuid,
        allocated_amount numeric
      )
    loop
      select balance.outstanding_amount
      into v_outstanding
      from public.contract_charge_balances balance
      where balance.id = v_allocation.charge_id;

      if v_allocation.allocated_amount > coalesce(v_outstanding, 0) then
        raise exception 'Payment allocation exceeds the outstanding amount of a fee' using errcode = '22003';
      end if;

      insert into public.customer_payment_allocations (
        payment_id,
        charge_id,
        allocated_amount
      )
      values (
        v_payment_id,
        v_allocation.charge_id,
        v_allocation.allocated_amount
      );
    end loop;
  end if;

  update public.customer_payments
  set unapplied_amount = greatest(v_amount - v_total_allocated, 0)
  where id = v_payment_id;

  for v_charge in
    update public.contract_charges charge
    set status = case
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
      join public.customer_payments payment
        on payment.id = allocation.payment_id
      where allocation.payment_id = v_payment_id
      group by allocation.charge_id
    ) balances
    where charge.id = balances.charge_id
    returning charge.id, charge.status
  loop
    if v_charge.status = 'paid' then
      perform public.ensure_next_contract_charge(v_charge.id);
    end if;
  end loop;

  return query select v_payment_id, v_total_allocated, greatest(v_amount - v_total_allocated, 0);
end;
$$;

revoke execute on function public.list_contract_payment_candidates(
  uuid, uuid, text, date, date
) from public, anon;
grant execute on function public.list_contract_payment_candidates(
  uuid, uuid, text, date, date
) to authenticated;

revoke execute on function public.record_contract_payment(
  uuid, uuid, uuid, text, numeric, timestamptz,
  public.customer_payment_method, text, text, jsonb, text, date, date
) from public, anon;
grant execute on function public.record_contract_payment(
  uuid, uuid, uuid, text, numeric, timestamptz,
  public.customer_payment_method, text, text, jsonb, text, date, date
) to authenticated;
