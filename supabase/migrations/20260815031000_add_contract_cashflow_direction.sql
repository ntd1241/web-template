do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'contract_cashflow_direction'
  ) then
    create type public.contract_cashflow_direction as enum ('receivable', 'payable');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'contract_version_lines'
      and column_name = 'direction'
  ) then
    alter table public.contract_version_lines
      add column direction public.contract_cashflow_direction not null default 'receivable';
  end if;
end;
$$;

comment on column public.contract_version_lines.direction is
  'Bản chất dòng tiền của khoản phí; receivable là khoản thu, payable là khoản chi.';

create or replace view public.contract_charge_balances as
select
  charge.id,
  charge.tenant_id,
  charge.customer_id,
  charge.contract_id,
  charge.contract_version_id,
  charge.contract_version_line_id,
  charge.period_start,
  charge.period_end,
  charge.due_date,
  charge.amount,
  charge.currency_code,
  case
    when charge.status = 'voided' then 'voided'::public.contract_charge_status
    when coalesce(sum(
      case when payment.status = 'posted' then allocation.allocated_amount else 0 end
    ), 0) >= charge.amount then 'paid'::public.contract_charge_status
    when coalesce(sum(
      case when payment.status = 'posted' then allocation.allocated_amount else 0 end
    ), 0) > 0 then 'partially_paid'::public.contract_charge_status
    when charge.due_date < current_date then 'overdue'::public.contract_charge_status
    else 'open'::public.contract_charge_status
  end as status,
  charge.void_reason,
  charge.created_at,
  coalesce(sum(
    case when payment.status = 'posted' then allocation.allocated_amount else 0 end
  ), 0)::numeric(18, 2) as paid_amount,
  greatest(
    charge.amount - coalesce(sum(
      case when payment.status = 'posted' then allocation.allocated_amount else 0 end
    ), 0),
    0
  )::numeric(18, 2) as outstanding_amount,
  line.direction
from public.contract_charges charge
join public.contract_version_lines line
  on line.id = charge.contract_version_line_id
left join public.customer_payment_allocations allocation
  on allocation.charge_id = charge.id
left join public.customer_payments payment
  on payment.id = allocation.payment_id
group by
  charge.id,
  charge.tenant_id,
  charge.customer_id,
  charge.contract_id,
  charge.contract_version_id,
  charge.contract_version_line_id,
  charge.period_start,
  charge.period_end,
  charge.due_date,
  charge.amount,
  charge.currency_code,
  charge.status,
  charge.void_reason,
  charge.created_at,
  line.direction;

create or replace view public.customer_receivable_summary as
with charge_totals as (
  select
    tenant_id,
    customer_id,
    currency_code,
    sum(amount)::numeric(18, 2) as total_billed,
    sum(paid_amount)::numeric(18, 2) as total_paid,
    sum(outstanding_amount)::numeric(18, 2) as total_outstanding,
    sum(case when status = 'overdue' then outstanding_amount else 0 end)::numeric(18, 2)
      as overdue_outstanding
  from public.contract_charge_balances
  where status <> 'voided'
    and direction = 'receivable'
  group by tenant_id, customer_id, currency_code
), payment_totals as (
  select
    payment.tenant_id,
    payment.customer_id,
    payment.currency_code,
    sum(payment.amount)::numeric(18, 2) as total_payments,
    coalesce(sum(allocation.allocated_amount), 0)::numeric(18, 2) as total_allocated
  from public.customer_payments payment
  left join public.customer_payment_allocations allocation
    on allocation.payment_id = payment.id
  where payment.status = 'posted'
  group by payment.tenant_id, payment.customer_id, payment.currency_code
), keys as (
  select tenant_id, customer_id, currency_code from charge_totals
  union
  select tenant_id, customer_id, currency_code from payment_totals
)
select
  keys.tenant_id,
  keys.customer_id,
  keys.currency_code,
  coalesce(charge_totals.total_billed, 0)::numeric(18, 2) as total_billed,
  coalesce(charge_totals.total_paid, 0)::numeric(18, 2) as total_paid,
  coalesce(charge_totals.total_outstanding, 0)::numeric(18, 2) as total_outstanding,
  coalesce(charge_totals.overdue_outstanding, 0)::numeric(18, 2) as overdue_outstanding,
  greatest(
    coalesce(payment_totals.total_payments, 0)
      - coalesce(payment_totals.total_allocated, 0),
    0
  )::numeric(18, 2) as unapplied_credit
from keys
left join charge_totals
  on charge_totals.tenant_id = keys.tenant_id
  and charge_totals.customer_id = keys.customer_id
  and charge_totals.currency_code = keys.currency_code
left join payment_totals
  on payment_totals.tenant_id = keys.tenant_id
  and payment_totals.customer_id = keys.customer_id
  and payment_totals.currency_code = keys.currency_code;

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
    join public.contract_version_lines line
      on line.id = charge.contract_version_line_id
    left join public.customer_payment_allocations allocation
      on allocation.charge_id = charge.id
    left join public.customer_payments payment
      on payment.id = allocation.payment_id
    where charge.tenant_id = p_tenant_id
      and charge.customer_id = p_customer_id
      and charge.currency_code = p_currency_code
      and charge.status <> 'voided'
      and line.direction = 'receivable'
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

