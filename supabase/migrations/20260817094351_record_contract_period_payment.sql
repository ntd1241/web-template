-- Record one payment against one contract payment period.
-- The client submits the fee-level allocation in the priority order chosen by the user.
create or replace function public.record_contract_period_payment(
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
declare
  v_payment_id uuid;
  v_amount numeric(18, 2) := round(p_amount, 2);
  v_total_allocated numeric(18, 2);
  v_period_outstanding numeric(18, 2);
  v_allocation_count integer;
  v_unique_allocation_count integer;
  v_target_charge_count integer;
  v_allocation record;
  v_charge record;
  v_outstanding numeric(18, 2);
begin
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

  if auth.uid() is not null
    and not public.has_tenant_permission(
      p_tenant_id,
      'contracts:record-payment'
    ) then
    raise exception 'Payment permission required' using errcode = '42501';
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
    and charge.period_start = p_period_start
    and charge.period_end = p_period_end
    and charge.due_date = p_due_date
    and charge.currency_code = p_currency_code
    and line.direction = 'receivable'
    and charge.status <> 'voided';

  if v_target_charge_count <> v_unique_allocation_count then
    raise exception 'Payment allocations contain a charge outside the selected period' using errcode = '22023';
  end if;

  -- Lock all charges in the period before calculating balances so concurrent payments
  -- cannot over-allocate the same fee.
  for v_charge in
    select charge.id
    from public.contract_charges charge
    join public.contract_version_lines line
      on line.id = charge.contract_version_line_id
    where charge.tenant_id = p_tenant_id
      and charge.customer_id = p_customer_id
      and charge.contract_id = p_contract_id
      and charge.period_start = p_period_start
      and charge.period_end = p_period_end
      and charge.due_date = p_due_date
      and charge.currency_code = p_currency_code
      and line.direction = 'receivable'
      and charge.status <> 'voided'
    for update of charge
  loop
    null;
  end loop;

  select coalesce(sum(
    greatest(
      charge.amount - coalesce((
        select sum(allocation.allocated_amount)
        from public.customer_payment_allocations allocation
        join public.customer_payments payment
          on payment.id = allocation.payment_id
        where allocation.charge_id = charge.id
          and payment.status = 'posted'
      ), 0),
      0
    )
  ), 0)::numeric(18, 2)
  into v_period_outstanding
  from public.contract_charges charge
  join public.contract_version_lines line
    on line.id = charge.contract_version_line_id
  where charge.tenant_id = p_tenant_id
    and charge.customer_id = p_customer_id
    and charge.contract_id = p_contract_id
    and charge.period_start = p_period_start
    and charge.period_end = p_period_end
    and charge.due_date = p_due_date
    and charge.currency_code = p_currency_code
    and line.direction = 'receivable'
    and charge.status <> 'voided';

  if v_amount > v_period_outstanding then
    raise exception 'Payment amount exceeds the outstanding amount of the selected period' using errcode = '22003';
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
    select greatest(
      charge.amount - coalesce((
        select sum(payment_allocation.allocated_amount)
        from public.customer_payment_allocations payment_allocation
        join public.customer_payments payment
          on payment.id = payment_allocation.payment_id
        where payment_allocation.charge_id = charge.id
          and payment.status = 'posted'
      ), 0),
      0
    )::numeric(18, 2)
    into v_outstanding
    from public.contract_charges charge
    where charge.id = v_allocation.charge_id;

    if v_allocation.allocated_amount > v_outstanding then
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
      join public.customer_payments payment on payment.id = allocation.payment_id
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

revoke execute on function public.record_contract_period_payment(
  uuid, uuid, uuid, date, date, date, numeric, text, timestamptz,
  public.customer_payment_method, text, text, jsonb
) from public, anon;
grant execute on function public.record_contract_period_payment(
  uuid, uuid, uuid, date, date, date, numeric, text, timestamptz,
  public.customer_payment_method, text, text, jsonb
) to authenticated;
