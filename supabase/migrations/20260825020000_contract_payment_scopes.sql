-- Payment candidates and posting for month/contract scopes.
-- Projected receivable periods are intentionally excluded: only persisted
-- contract_charges with a positive outstanding balance can receive money.

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

  with scope_balances as (
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
  ), candidates as (
    select *
    from scope_balances
    where outstanding_amount > 0
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
    'outstanding_amount', coalesce((select sum(candidate.outstanding_amount) from candidates candidate), 0)
  )
  into v_result;

  return v_result;
end;
$$;

create or replace function public.list_contract_payment_candidates_scoped(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_scope text default 'contract',
  p_scope_start date default null,
  p_scope_end date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  return public.list_contract_payment_candidates(
    p_tenant_id,
    p_contract_id,
    p_scope,
    p_scope_start,
    p_scope_end
  );
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
  v_total_allocated numeric(18, 2);
  v_scope_outstanding numeric(18, 2);
  v_allocation_count integer;
  v_unique_allocation_count integer;
  v_target_charge_count integer;
  v_allocation record;
  v_charge record;
  v_outstanding numeric(18, 2);
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:record-payment')
  then
    raise exception 'Payment permission required' using errcode = '42501';
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

  if p_allocations is null or jsonb_typeof(p_allocations) <> 'array'
    or jsonb_array_length(p_allocations) = 0 then
    raise exception 'Payment allocations are required' using errcode = '22023';
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
    and (
      v_scope = 'contract'
      or (
        balance.period_start >= p_scope_start
        and balance.period_start <= p_scope_end
      )
    );

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

  select coalesce(sum(balance.outstanding_amount), 0)::numeric(18, 2)
  into v_scope_outstanding
  from public.contract_charge_balances balance
  where balance.tenant_id = p_tenant_id
    and balance.customer_id = p_customer_id
    and balance.contract_id = p_contract_id
    and balance.currency_code = p_currency_code
    and balance.direction = 'receivable'
    and balance.status <> 'voided'
    and balance.outstanding_amount > 0
    and (
      v_scope = 'contract'
      or (
        balance.period_start >= p_scope_start
        and balance.period_start <= p_scope_end
      )
    );

  if v_amount > v_scope_outstanding then
    raise exception 'Payment amount exceeds the outstanding amount of the selected scope' using errcode = '22003';
  end if;

  if round(v_total_allocated, 2) <> v_amount then
    raise exception 'Payment allocations must equal the payment amount' using errcode = '22003';
  end if;

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
  end loop;

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
    v_amount,
    p_currency_code,
    p_payment_method,
    coalesce(btrim(p_reference), ''),
    coalesce(btrim(p_note), ''),
    auth.uid()
  )
  returning id into v_payment_id;

  insert into public.customer_payment_allocations (
    payment_id,
    charge_id,
    allocated_amount
  )
  select
    v_payment_id,
    allocation.charge_id,
    round(allocation.allocated_amount, 2)
  from jsonb_to_recordset(p_allocations) as allocation(
    charge_id uuid,
    allocated_amount numeric
  );

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

  return query select v_payment_id, v_amount, 0::numeric(18, 2);
end;
$$;

create or replace function public.record_contract_payment_scoped(
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
begin
  if auth.uid() is null
    or not public.has_contract_permission(p_contract_id, 'contracts:record-payment')
  then
    raise exception 'Contract payment permission required' using errcode = '42501';
  end if;

  return query
  select *
  from public.record_contract_payment(
    p_tenant_id,
    p_contract_id,
    p_customer_id,
    p_currency_code,
    p_amount,
    p_received_at,
    p_payment_method,
    p_reference,
    p_note,
    p_allocations,
    p_scope,
    p_scope_start,
    p_scope_end
  );
end;
$$;

revoke execute on function public.list_contract_payment_candidates(
  uuid, uuid, text, date, date
) from public, anon;
grant execute on function public.list_contract_payment_candidates(
  uuid, uuid, text, date, date
) to authenticated;

revoke execute on function public.list_contract_payment_candidates_scoped(
  uuid, uuid, text, date, date
) from public, anon;
grant execute on function public.list_contract_payment_candidates_scoped(
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

revoke execute on function public.record_contract_payment_scoped(
  uuid, uuid, uuid, text, numeric, timestamptz,
  public.customer_payment_method, text, text, jsonb, text, date, date
) from public, anon;
grant execute on function public.record_contract_payment_scoped(
  uuid, uuid, uuid, text, numeric, timestamptz,
  public.customer_payment_method, text, text, jsonb, text, date, date
) to authenticated;
