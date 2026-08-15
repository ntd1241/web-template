do $$
begin
  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_status'
  ) then
    create type public.contract_status as enum (
      'draft', 'active', 'suspended', 'expired', 'terminated'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_version_status'
  ) then
    create type public.contract_version_status as enum (
      'draft', 'effective', 'superseded', 'cancelled'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_billing_type'
  ) then
    create type public.contract_billing_type as enum ('recurring', 'one_time');
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_billing_unit'
  ) then
    create type public.contract_billing_unit as enum ('month', 'quarter', 'year');
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_due_rule'
  ) then
    create type public.contract_due_rule as enum (
      'on_period_start', 'on_period_end', 'after_days'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'contract_charge_status'
  ) then
    create type public.contract_charge_status as enum (
      'open', 'partially_paid', 'paid', 'overdue', 'voided'
    );
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'customer_payment_status'
  ) then
    create type public.customer_payment_status as enum ('posted', 'reversed');
  end if;

  if not exists (
    select 1 from pg_type
    where typnamespace = 'public'::regnamespace and typname = 'customer_payment_method'
  ) then
    create type public.customer_payment_method as enum (
      'bank_transfer', 'cash', 'other'
    );
  end if;
end;
$$;

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  contract_code text not null,
  name text not null,
  status public.contract_status not null default 'draft',
  currency_code text not null default 'VND',
  start_date date not null,
  end_date date,
  auto_renew boolean not null default false,
  renewal_notice_days integer,
  payment_priority integer not null default 0,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contracts_tenant_code_unique unique (tenant_id, contract_code),
  constraint contracts_code_not_blank check (length(btrim(contract_code)) > 0),
  constraint contracts_name_not_blank check (length(btrim(name)) > 0),
  constraint contracts_currency_code_format check (currency_code ~ '^[A-Z]{3}$'),
  constraint contracts_date_range_check check (end_date is null or end_date >= start_date),
  constraint contracts_renewal_notice_days_check check (
    renewal_notice_days is null or renewal_notice_days >= 0
  ),
  constraint contracts_payment_priority_check check (payment_priority >= 0),
  constraint contracts_auto_renew_notice_check check (
    auto_renew = false or renewal_notice_days is not null
  )
);

create index contracts_tenant_customer_idx
  on public.contracts(tenant_id, customer_id, status);
create index contracts_tenant_status_idx
  on public.contracts(tenant_id, status, start_date, end_date);

create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

create table public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  version_no integer not null,
  status public.contract_version_status not null default 'draft',
  effective_from date not null,
  effective_to date,
  change_reason text not null default '',
  terms_snapshot jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_versions_contract_version_unique unique (contract_id, version_no),
  constraint contract_versions_version_no_check check (version_no > 0),
  constraint contract_versions_date_range_check check (
    effective_to is null or effective_to >= effective_from
  ),
  constraint contract_versions_published_consistency_check check (
    (status in ('effective', 'superseded') and published_at is not null)
    or status in ('draft', 'cancelled')
  )
);

create index contract_versions_contract_effective_idx
  on public.contract_versions(contract_id, status, effective_from, effective_to);

create trigger contract_versions_set_updated_at
before update on public.contract_versions
for each row execute function public.set_updated_at();

create table public.contract_version_lines (
  id uuid primary key default gen_random_uuid(),
  contract_version_id uuid not null references public.contract_versions(id) on delete cascade,
  name text not null,
  quantity numeric(18, 6) not null default 1,
  unit_price numeric(18, 2) not null,
  amount numeric(18, 2) generated always as (round(quantity * unit_price, 2)) stored,
  billing_type public.contract_billing_type not null,
  billing_unit public.contract_billing_unit,
  billing_interval integer,
  charge_date date,
  due_rule public.contract_due_rule not null default 'on_period_end',
  due_days integer,
  start_date date not null,
  end_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint contract_version_lines_name_not_blank check (length(btrim(name)) > 0),
  constraint contract_version_lines_quantity_check check (quantity > 0),
  constraint contract_version_lines_unit_price_check check (unit_price >= 0),
  constraint contract_version_lines_billing_check check (
    (
      billing_type = 'recurring'
      and billing_unit is not null
      and billing_interval is not null
      and billing_interval > 0
      and charge_date is null
    )
    or (
      billing_type = 'one_time'
      and billing_unit is null
      and billing_interval is null
      and charge_date is not null
    )
  ),
  constraint contract_version_lines_due_rule_check check (
    (due_rule = 'after_days' and due_days is not null and due_days >= 0)
    or (due_rule <> 'after_days' and due_days is null)
  ),
  constraint contract_version_lines_date_range_check check (
    end_date is null or end_date >= start_date
  ),
  constraint contract_version_lines_charge_date_check check (
    charge_date is null or charge_date >= start_date
  ),
  constraint contract_version_lines_sort_order_check check (sort_order >= 0)
);

create index contract_version_lines_version_sort_idx
  on public.contract_version_lines(contract_version_id, sort_order, id);

create trigger contract_version_lines_set_updated_at
before update on public.contract_version_lines
for each row execute function public.set_updated_at();

create table public.contract_charges (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  contract_id uuid not null references public.contracts(id) on delete restrict,
  contract_version_id uuid not null references public.contract_versions(id) on delete restrict,
  contract_version_line_id uuid not null references public.contract_version_lines(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  due_date date not null,
  amount numeric(18, 2) not null,
  currency_code text not null,
  status public.contract_charge_status not null default 'open',
  void_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint contract_charges_period_range_check check (period_end >= period_start),
  constraint contract_charges_amount_check check (amount > 0),
  constraint contract_charges_currency_code_format check (currency_code ~ '^[A-Z]{3}$'),
  constraint contract_charges_unique_period unique (
    contract_version_line_id,
    period_start,
    period_end
  ),
  constraint contract_charges_void_reason_check check (
    (status = 'voided' and nullif(btrim(void_reason), '') is not null)
    or status <> 'voided'
  )
);

create index contract_charges_customer_balance_idx
  on public.contract_charges(tenant_id, customer_id, currency_code, due_date, status);
create index contract_charges_contract_period_idx
  on public.contract_charges(contract_id, period_start, period_end);
create index contract_charges_version_line_idx
  on public.contract_charges(contract_version_line_id, period_start);

create table public.customer_payments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete restrict,
  received_at timestamptz not null default timezone('utc', now()),
  amount numeric(18, 2) not null,
  currency_code text not null,
  payment_method public.customer_payment_method not null,
  reference text not null default '',
  note text not null default '',
  status public.customer_payment_status not null default 'posted',
  created_by uuid references auth.users(id) on delete set null,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint customer_payments_amount_check check (amount > 0),
  constraint customer_payments_currency_code_format check (currency_code ~ '^[A-Z]{3}$'),
  constraint customer_payments_reversal_check check (
    (status = 'reversed' and reversed_at is not null and nullif(btrim(reversal_reason), '') is not null)
    or (status = 'posted' and reversed_at is null and reversal_reason is null)
  )
);

create index customer_payments_customer_received_idx
  on public.customer_payments(tenant_id, customer_id, currency_code, received_at desc);

create table public.customer_payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.customer_payments(id) on delete restrict,
  charge_id uuid not null references public.contract_charges(id) on delete restrict,
  allocated_amount numeric(18, 2) not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint customer_payment_allocations_unique_pair unique (payment_id, charge_id),
  constraint customer_payment_allocations_amount_check check (allocated_amount > 0)
);

create index customer_payment_allocations_charge_idx
  on public.customer_payment_allocations(charge_id, payment_id);

create index customer_payment_allocations_payment_idx
  on public.customer_payment_allocations(payment_id, charge_id);

create or replace function public.contract_calculate_due_date(
  p_period_start date,
  p_period_end date,
  p_due_rule public.contract_due_rule,
  p_due_days integer
)
returns date
language sql
immutable
set search_path = public
as $$
  select case p_due_rule
    when 'on_period_start' then p_period_start
    when 'on_period_end' then p_period_end
    when 'after_days' then p_period_end + coalesce(p_due_days, 0)
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
  v_cycle_months integer;
  v_inserted integer;
  v_total_inserted integer := 0;
begin
  if p_through_date is null then
    raise exception 'through_date is required' using errcode = '22004';
  end if;

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
      and version.effective_from <= p_through_date
      and (version.effective_to is null or version.effective_to >= version.effective_from)
  loop
    if v_contract.billing_type = 'one_time' then
      if v_contract.charge_date <= p_through_date
        and v_contract.charge_date >= v_contract.effective_from
        and (v_contract.effective_to is null or v_contract.charge_date <= v_contract.effective_to)
      then
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
        on conflict (contract_version_line_id, period_start, period_end) do nothing;

        get diagnostics v_inserted = row_count;
        v_total_inserted := v_total_inserted + v_inserted;
      end if;
    else
      v_cycle_months := case v_contract.billing_unit
        when 'month' then v_contract.billing_interval
        when 'quarter' then v_contract.billing_interval * 3
        when 'year' then v_contract.billing_interval * 12
      end;

      v_anchor := greatest(
        v_contract.contract_start_date,
        v_contract.effective_from,
        v_contract.line_start_date
      );
      v_upper := least(
        p_through_date,
        coalesce(v_contract.contract_end_date, p_through_date),
        coalesce(v_contract.effective_to, p_through_date),
        coalesce(v_contract.line_end_date, p_through_date)
      );

      if v_anchor <= v_upper then
        for v_period_start in
          select generated_period::date
          from generate_series(
            v_anchor,
            v_upper,
            make_interval(months => v_cycle_months)
          ) as generated_period
        loop
          v_period_end := least(
            (
              v_period_start + make_interval(months => v_cycle_months) - interval '1 day'
            )::date,
            v_upper
          );

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
          on conflict (contract_version_line_id, period_start, period_end) do nothing;

          get diagnostics v_inserted = row_count;
          v_total_inserted := v_total_inserted + v_inserted;
        end loop;
      end if;
    end if;
  end loop;

  return v_total_inserted;
end;
$$;

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
  )::numeric(18, 2) as outstanding_amount
from public.contract_charges charge
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
  charge.created_at;

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
      charge.period_start,
      contract.payment_priority
    from public.contract_charges charge
    join public.contracts contract on contract.id = charge.contract_id
    left join public.customer_payment_allocations allocation
      on allocation.charge_id = charge.id
    left join public.customer_payments payment
      on payment.id = allocation.payment_id
    where charge.tenant_id = p_tenant_id
      and charge.customer_id = p_customer_id
      and charge.currency_code = p_currency_code
      and charge.status <> 'voided'
    group by charge.id, charge.amount, charge.due_date, charge.period_start, contract.payment_priority
    having charge.amount - coalesce(sum(
      case when payment.status = 'posted' then allocation.allocated_amount else 0 end
    ), 0) > 0
    order by
      (charge.due_date < coalesce(p_received_at::date, current_date)) desc,
      charge.due_date asc,
      contract.payment_priority desc,
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

insert into public.permission_modules (code, name, description, sort_order, is_active)
values (
  'contracts',
  'Hợp đồng',
  'Quản lý hợp đồng, phiên bản, kỳ phải thu và thanh toán khách hàng',
  25,
  true
)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_groups (
  module_code, code, name, description, sort_order, is_active
)
values
  (
    'contracts',
    'contracts',
    'Hợp đồng',
    'Vòng đời và phiên bản hợp đồng',
    10,
    true
  ),
  (
    'contracts',
    'receivables',
    'Công nợ và thanh toán',
    'Kỳ phải thu, thu tiền và phân bổ thanh toán',
    20,
    true
  )
on conflict (module_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_definitions (
  code,
  module_code,
  group_name,
  group_id,
  name,
  action,
  sensitive,
  sort_order,
  tags,
  is_active
)
select
  seed.code,
  'contracts',
  permission_group.name,
  permission_group.id,
  seed.name,
  seed.action,
  seed.sensitive,
  seed.sort_order,
  seed.tags,
  true
from public.permission_groups permission_group
join (
  values
    ('contracts', 'contracts:view', 'Xem hợp đồng', 'view', false, 10, array['Xem']::text[]),
    ('contracts', 'contracts:create', 'Tạo hợp đồng', 'create', false, 20, array['Chỉnh sửa']::text[]),
    ('contracts', 'contracts:update', 'Chỉnh sửa hợp đồng', 'update', false, 30, array['Chỉnh sửa']::text[]),
    ('contracts', 'contracts:publish', 'Phát hành phiên bản hợp đồng', 'approve', true, 40, array['Chỉnh sửa', 'Duyệt']::text[]),
    ('contracts', 'contracts:amend', 'Tạo phiên bản điều chỉnh', 'update', false, 50, array['Chỉnh sửa']::text[]),
    ('contracts', 'contracts:terminate', 'Chấm dứt hợp đồng', 'delete', true, 60, array['Xóa', 'Duyệt']::text[]),
    ('receivables', 'contracts:record-payment', 'Ghi nhận thanh toán khách hàng', 'update', true, 70, array['Chỉnh sửa', 'Duyệt']::text[]),
    ('receivables', 'contracts:reverse-payment', 'Đảo ngược thanh toán', 'delete', true, 80, array['Xóa', 'Duyệt']::text[])
) as seed(group_code, code, name, action, sensitive, sort_order, tags)
  on seed.group_code = permission_group.code
where permission_group.module_code = 'contracts'
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  group_id = excluded.group_id,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  tags = excluded.tags,
  is_active = true;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, definition.code
from public.roles role_record
cross join public.permission_definitions definition
where role_record.code = 'admin'
  and definition.module_code = 'contracts'
  and definition.is_active
on conflict do nothing;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, selected.permission_code
from public.roles role_record
cross join unnest(array[
  'contracts:view',
  'contracts:create',
  'contracts:update',
  'contracts:publish',
  'contracts:amend'
]::text[]) as selected(permission_code)
where role_record.code = 'manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_code)
select role_record.id, selected.permission_code
from public.roles role_record
cross join unnest(array[
  'contracts:view',
  'contracts:record-payment',
  'contracts:reverse-payment'
]::text[]) as selected(permission_code)
where role_record.code = 'accountant'
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
    'contracts:publish', 'contracts:amend'
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

grant select, insert, update on public.contracts to authenticated;
grant select, insert, update on public.contract_versions to authenticated;
grant select, insert, update on public.contract_version_lines to authenticated;
grant select on public.contract_charges to authenticated;
grant select on public.customer_payments to authenticated;
grant select on public.customer_payment_allocations to authenticated;
grant select on public.contract_charge_balances to authenticated;
grant select on public.customer_receivable_summary to authenticated;

revoke execute on function public.contract_calculate_due_date(
  date, date, public.contract_due_rule, integer
) from public, anon;
grant execute on function public.contract_calculate_due_date(
  date, date, public.contract_due_rule, integer
) to authenticated;

revoke execute on function public.ensure_contract_charges(uuid, date) from public, anon;
grant execute on function public.ensure_contract_charges(uuid, date) to authenticated;

revoke execute on function public.record_customer_payment(
  uuid, uuid, numeric, text, timestamptz, public.customer_payment_method, text, text
) from public, anon;
grant execute on function public.record_customer_payment(
  uuid, uuid, numeric, text, timestamptz, public.customer_payment_method, text, text
) to authenticated;
