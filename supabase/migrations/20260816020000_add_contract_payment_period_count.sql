-- Return the number of grouped payment periods that still have an outstanding balance.
-- This endpoint is intentionally separate from the payment-period list query so
-- detail tabs can show a lightweight count badge without loading table rows.
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
      and status <> 'voided'
      and outstanding_amount > 0
    group by
      period_start,
      period_end,
      due_date,
      currency_code,
      direction
  ) grouped_periods;
$$;

grant execute on function public.get_contract_payment_period_count(uuid, uuid)
  to authenticated;
