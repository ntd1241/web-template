create index if not exists contracts_tenant_created_at_id_idx
  on public.contracts (tenant_id, created_at desc, id desc);

create or replace function public.list_contracts(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_status public.contract_status default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_page integer := greatest(coalesce(p_page, 1), 1);
  v_page_size integer := least(greatest(coalesce(p_page_size, 10), 1), 100);
  v_search text := nullif(btrim(p_search), '');
  v_result jsonb;
begin
  if auth.uid() is null
    or not public.has_tenant_permission(p_tenant_id, 'contracts:view')
  then
    raise exception 'Contract view permission required' using errcode = '42501';
  end if;

  with charge_balances as (
    select
      charge.id,
      charge.contract_id,
      charge.amount,
      charge.due_date,
      greatest(
        charge.amount - coalesce(sum(
          case
            when payment.status = 'posted' then allocation.allocated_amount
            else 0
          end
        ), 0),
        0
      )::numeric(18, 2) as outstanding_amount
    from public.contract_charges charge
    join public.contract_version_lines line
      on line.id = charge.contract_version_line_id
    left join public.customer_payment_allocations allocation
      on allocation.charge_id = charge.id
    left join public.customer_payments payment
      on payment.id = allocation.payment_id
    where charge.tenant_id = p_tenant_id
      and charge.status <> 'voided'
      and line.direction = 'receivable'
    group by charge.id, charge.contract_id, charge.amount, charge.due_date
  ), contract_summaries as (
    select
      contract_id,
      coalesce(sum(outstanding_amount), 0)::numeric(18, 2) as total_outstanding,
      min(due_date) filter (where outstanding_amount > 0) as next_due_date
    from charge_balances
    group by contract_id
  ), filtered_contracts as (
    select
      contract.id,
      contract.tenant_id,
      contract.customer_id,
      contract.created_by,
      contract.contract_code,
      contract.name,
      contract.status,
      contract.currency_code,
      contract.start_date,
      contract.end_date,
      contract.auto_renew,
      contract.note,
      contract.created_at,
      contract.updated_at,
      customer.name as customer_name,
      customer.customer_code,
      customer.image_url as customer_image_url,
      coalesce(summary.total_outstanding, 0)::numeric(18, 2) as total_outstanding,
      summary.next_due_date,
      count(*) over () as total_count
    from public.contracts contract
    join public.customers customer
      on customer.id = contract.customer_id
    left join contract_summaries summary
      on summary.contract_id = contract.id
    where contract.tenant_id = p_tenant_id
      and (p_status is null or contract.status = p_status)
      and (
        v_search is null
        or contract.contract_code ilike '%' || v_search || '%'
        or contract.name ilike '%' || v_search || '%'
        or customer.customer_code ilike '%' || v_search || '%'
        or customer.name ilike '%' || v_search || '%'
      )
  )
  select jsonb_build_object(
    'items', coalesce(
      (
        select jsonb_agg(
          to_jsonb(page_row) - 'total_count'
          order by page_row.created_at desc, page_row.id desc
        )
        from (
          select *
          from filtered_contracts
          order by created_at desc, id desc
          offset (v_page - 1) * v_page_size
          limit v_page_size
        ) page_row
      ),
      '[]'::jsonb
    ),
    'total', coalesce((select max(total_count) from filtered_contracts), 0)
  )
  into v_result;

  return v_result;
end;
$$;

revoke execute on function public.list_contracts(
  uuid,
  integer,
  integer,
  text,
  public.contract_status
) from public, anon;
grant execute on function public.list_contracts(
  uuid,
  integer,
  integer,
  text,
  public.contract_status
) to authenticated;
