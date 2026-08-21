-- The tab badge represents periods that need collection now. Future periods
-- remain visible in the table but do not count as actionable work.
create or replace function public.get_contract_payment_period_count(
  p_tenant_id uuid,
  p_contract_id uuid
)
returns bigint
language sql
stable
as $$
  select count(*)::bigint
  from (
    select
      period_start,
      period_end,
      due_date,
      currency_code,
      direction
    from public.contract_charge_balances
    where tenant_id = p_tenant_id
      and contract_id = p_contract_id
      and direction = 'receivable'
      and status <> 'voided'
      and outstanding_amount > 0
      and due_date <= current_date
    group by
      period_start,
      period_end,
      due_date,
      currency_code,
      direction
  ) grouped_periods;
$$;
