-- Contract renewal reminders will be configured globally in a later migration.
-- Payment allocation is deterministic by receivable chronology; it is not a
-- per-contract setting.

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
      greatest(
        charge.amount - coalesce(sum(
          case when payment.status = 'posted' then allocation.allocated_amount else 0 end
        ), 0),
        0
      )::numeric(18, 2) as outstanding_amount,
      charge.due_date,
      charge.period_start
    from public.contract_charges charge
    left join public.customer_payment_allocations allocation
      on allocation.charge_id = charge.id
    left join public.customer_payments payment
      on payment.id = allocation.payment_id
    where charge.tenant_id = p_tenant_id
      and charge.customer_id = p_customer_id
      and charge.currency_code = p_currency_code
      and charge.status <> 'voided'
    group by charge.id, charge.amount, charge.due_date, charge.period_start
    having charge.amount - coalesce(sum(
      case when payment.status = 'posted' then allocation.allocated_amount else 0 end
    ), 0) > 0
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
      select charge_id
      from public.customer_payment_allocations
      where payment_id = v_payment_id
    )
    group by allocation.charge_id
  ) balances
  where charge.id = balances.charge_id;

  return query
  select v_payment_id, v_allocated, v_remaining;
end;
$$;

alter table public.contracts
  drop constraint if exists contracts_auto_renew_notice_check,
  drop constraint if exists contracts_renewal_notice_days_check,
  drop constraint if exists contracts_payment_priority_check,
  drop column if exists renewal_notice_days,
  drop column if exists payment_priority;
