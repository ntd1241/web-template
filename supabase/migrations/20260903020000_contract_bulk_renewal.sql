-- Expose renewal-draft metadata to the contract list and provide a single
-- server-side operation for creating renewal drafts for multiple contracts.

create or replace function public.list_contracts(
  p_tenant_id uuid,
  p_page integer default 1,
  p_page_size integer default 10,
  p_search text default null,
  p_status public.contract_status default null,
  p_customer_id uuid default null,
  p_customer_code text default null,
  p_outstanding_min numeric default null,
  p_outstanding_max numeric default null,
  p_next_due_from date default null,
  p_next_due_to date default null,
  p_statuses public.contract_status[] default null,
  p_contract_search text default null
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
  v_contract_search text := nullif(btrim(p_contract_search), '');
  v_customer_code text := nullif(btrim(p_customer_code), '');
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
      coalesce(sum(outstanding_amount) filter (where due_date <= current_date), 0)::numeric(18, 2) as total_outstanding,
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
      (renewal_draft.version_no is not null) as has_renewal_draft,
      renewal_draft.version_no as renewal_draft_version_no,
      count(*) over () as total_count
    from public.contracts contract
    join public.customers customer
      on customer.id = contract.customer_id
    left join contract_summaries summary
      on summary.contract_id = contract.id
    left join lateral (
      select version.version_no
      from public.contract_versions version
      where version.contract_id = contract.id
        and version.version_kind = 'renewal'
        and version.status = 'draft'
      order by version.version_no desc
      limit 1
    ) renewal_draft on true
    where contract.tenant_id = p_tenant_id
      and (p_status is null or contract.status = p_status)
      and (
        p_statuses is null
        or cardinality(p_statuses) = 0
        or contract.status = any(p_statuses)
      )
      and (
        v_contract_search is null
        or contract.contract_code ilike '%' || v_contract_search || '%'
        or contract.name ilike '%' || v_contract_search || '%'
      )
      and (p_customer_id is null or contract.customer_id = p_customer_id)
      and (v_customer_code is null or customer.customer_code ilike '%' || v_customer_code || '%')
      and (p_outstanding_min is null or coalesce(summary.total_outstanding, 0) >= p_outstanding_min)
      and (p_outstanding_max is null or coalesce(summary.total_outstanding, 0) <= p_outstanding_max)
      and (p_next_due_from is null or summary.next_due_date >= p_next_due_from)
      and (p_next_due_to is null or summary.next_due_date <= p_next_due_to)
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
  uuid, integer, integer, text, public.contract_status, uuid, text,
  numeric, numeric, date, date, public.contract_status[], text
) from public, anon;

grant execute on function public.list_contracts(
  uuid, integer, integer, text, public.contract_status, uuid, text,
  numeric, numeric, date, date, public.contract_status[], text
) to authenticated;

create or replace function public.create_contract_renewal_drafts_scoped(
  p_tenant_id uuid,
  p_contract_ids uuid[],
  p_duration_value integer,
  p_duration_unit text,
  p_fee_increase_percent numeric,
  p_override_draft boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_current_version record;
  v_lines jsonb;
  v_start_date date;
  v_end_date date;
  v_item jsonb;
  v_items jsonb := '[]'::jsonb;
  v_requested_count integer;
  v_processed_count integer := 0;
  v_overrode_draft_count integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if p_contract_ids is null or cardinality(p_contract_ids) = 0 then
    raise exception 'At least one contract is required' using errcode = '22023';
  end if;

  if p_duration_value is null or p_duration_value <= 0 then
    raise exception 'Renewal duration must be greater than zero'
      using errcode = '22023';
  end if;

  if p_duration_unit is null
    or p_duration_unit not in ('day', 'month', 'year') then
    raise exception 'Invalid renewal duration unit' using errcode = '22023';
  end if;

  if p_fee_increase_percent is null or p_fee_increase_percent < 0 then
    raise exception 'Fee increase percentage cannot be negative'
      using errcode = '22023';
  end if;

  select count(distinct contract_id)::integer
  into v_requested_count
  from unnest(p_contract_ids) as requested(contract_id);

  for v_contract in
    select contract.*
    from public.contracts contract
    where contract.tenant_id = p_tenant_id
      and contract.id = any(p_contract_ids)
    order by contract.id
  loop
    v_processed_count := v_processed_count + 1;

    if not public.has_contract_permission(v_contract.id, 'contracts:amend') then
      raise exception 'Contract amendment permission required'
        using errcode = '42501';
    end if;

    if v_contract.status not in ('active', 'expired') then
      raise exception 'Only active or expired contracts can be renewed'
        using errcode = '22023';
    end if;

    select version.*
    into v_current_version
    from public.contract_versions version
    where version.contract_id = v_contract.id
      and version.status = 'effective'
    order by version.version_no desc
    limit 1;

    if not found then
      raise exception 'Contract has no effective version' using errcode = 'P0002';
    end if;

    v_start_date := coalesce(v_contract.end_date + 1, current_date);
    v_end_date := case p_duration_unit
      when 'day' then v_start_date + p_duration_value
      when 'month' then (v_start_date + make_interval(months => p_duration_value))::date
      when 'year' then (v_start_date + make_interval(years => p_duration_value))::date
    end;

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'direction', line.direction,
          'name', line.name,
          'quantity', line.quantity,
          'unit_price', case
            when line.direction = 'receivable'
            then round(line.unit_price * (1 + p_fee_increase_percent / 100), 2)
            else line.unit_price
          end,
          'billing_type', line.billing_type,
          'billing_unit', line.billing_unit,
          'billing_interval', line.billing_interval,
          'due_rule', line.due_rule,
          'due_days', line.due_days
        )
        order by line.sort_order, line.id
      ),
      '[]'::jsonb
    )
    into v_lines
    from public.contract_version_lines line
    where line.contract_version_id = v_current_version.id;

    if jsonb_array_length(v_lines) = 0 then
      raise exception 'At least one renewal fee is required' using errcode = '22023';
    end if;

    v_item := public.create_contract_renewal_draft_scoped(
      p_tenant_id,
      v_contract.id,
      v_start_date,
      v_end_date,
      v_lines,
      p_override_draft
    );

    v_items := v_items || jsonb_build_array(v_item);
    if coalesce((v_item ->> 'overrodeDraft')::boolean, false) then
      v_overrode_draft_count := v_overrode_draft_count + 1;
    end if;
  end loop;

  if v_processed_count <> v_requested_count then
    raise exception 'One or more contracts were not found'
      using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'items', v_items,
    'total', jsonb_array_length(v_items),
    'overrodeDraftCount', v_overrode_draft_count
  );
end;
$$;

revoke execute on function public.create_contract_renewal_drafts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) from public, anon;

grant execute on function public.create_contract_renewal_drafts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) to authenticated;

notify pgrst, 'reload schema';
