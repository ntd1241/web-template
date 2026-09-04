-- Activate bulk renewals immediately. The new version starts after the
-- currently effective version ends and the contract keeps its active status.

create or replace function public.renew_contract_active_scoped(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_start_date date,
  p_end_date date,
  p_lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract record;
  v_current_version record;
  v_new_version_id uuid;
  v_next_version_no integer;
  v_generated_charge_count integer := 0;
  v_snapshot jsonb;
  v_line record;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not public.has_contract_permission(p_contract_id, 'contracts:amend') then
    raise exception 'Contract amendment permission required'
      using errcode = '42501';
  end if;

  if p_start_date is null or p_end_date is null then
    raise exception 'Renewal start and end dates are required'
      using errcode = '22004';
  end if;

  if p_end_date < p_start_date then
    raise exception 'Renewal end date must be on or after start date'
      using errcode = '22007';
  end if;

  if p_lines is null
    or jsonb_typeof(p_lines) <> 'array'
    or jsonb_array_length(p_lines) = 0 then
    raise exception 'At least one renewal fee is required'
      using errcode = '22023';
  end if;

  select contract.*
  into v_contract
  from public.contracts contract
  where contract.id = p_contract_id
    and contract.tenant_id = p_tenant_id
  for update;

  if not found then
    raise exception 'Contract not found' using errcode = 'P0002';
  end if;

  if v_contract.status not in ('active', 'expired') then
    raise exception 'Only active or expired contracts can be renewed'
      using errcode = '22023';
  end if;

  select version.*
  into v_current_version
  from public.contract_versions version
  where version.contract_id = p_contract_id
    and version.status = 'effective'
  order by version.version_no desc
  limit 1
  for update;

  if not found then
    raise exception 'Contract has no effective version' using errcode = 'P0002';
  end if;

  if p_start_date <= v_current_version.effective_from then
    raise exception 'Renewal start date must be after the current version start'
      using errcode = '22007';
  end if;

  if v_contract.end_date is not null
    and p_start_date <= v_contract.end_date then
    raise exception 'Renewal start date must be after the current contract end'
      using errcode = '22007';
  end if;

  if v_current_version.effective_to is not null
    and p_start_date <= v_current_version.effective_to then
    raise exception 'Renewal start date overlaps the current version'
      using errcode = '22007';
  end if;

  select coalesce(max(version.version_no), 0) + 1
  into v_next_version_no
  from public.contract_versions version
  where version.contract_id = p_contract_id;

  v_snapshot := coalesce(v_current_version.terms_snapshot, '{}'::jsonb)
    || jsonb_build_object(
      'startDate', p_start_date::text,
      'endDate', p_end_date::text
    );

  update public.contract_versions
  set
    status = 'superseded',
    effective_to = p_start_date - 1,
    updated_at = timezone('utc', now())
  where id = v_current_version.id;

  insert into public.contract_versions (
    contract_id,
    version_no,
    status,
    version_kind,
    effective_from,
    effective_to,
    change_reason,
    terms_snapshot,
    created_by,
    published_at
  )
  values (
    p_contract_id,
    v_next_version_no,
    'effective',
    'renewal',
    p_start_date,
    p_end_date,
    'Gia hạn hợp đồng',
    v_snapshot,
    auth.uid(),
    timezone('utc', now())
  )
  returning id into v_new_version_id;

  for v_line in
    select *
    from jsonb_to_recordset(p_lines) as line(
      direction text,
      name text,
      quantity numeric,
      unit_price numeric,
      billing_type text,
      billing_unit text,
      billing_interval integer,
      due_rule text,
      due_days integer
    )
  loop
    if v_line.direction is null
      or v_line.direction not in ('receivable', 'payable') then
      raise exception 'Invalid renewal fee direction' using errcode = '22023';
    end if;

    if nullif(btrim(v_line.name), '') is null then
      raise exception 'Renewal fee name is required' using errcode = '22023';
    end if;

    if v_line.quantity is null or v_line.quantity <= 0 then
      raise exception 'Renewal fee quantity must be greater than zero'
        using errcode = '22023';
    end if;

    if v_line.unit_price is null or v_line.unit_price < 0 then
      raise exception 'Renewal fee unit price cannot be negative'
        using errcode = '22023';
    end if;

    if v_line.billing_type is null
      or v_line.billing_type not in ('recurring', 'one_time') then
      raise exception 'Invalid renewal fee billing type' using errcode = '22023';
    end if;

    if v_line.billing_type = 'recurring' then
      if v_line.billing_unit is null
        or v_line.billing_unit not in ('month', 'quarter', 'year')
        or v_line.billing_interval is null
        or v_line.billing_interval <= 0 then
        raise exception 'Recurring renewal fee needs a valid billing interval'
          using errcode = '22023';
      end if;
    elsif v_line.billing_unit is not null
      or v_line.billing_interval is not null then
      raise exception 'One-time renewal fee cannot have a billing interval'
        using errcode = '22023';
    end if;

    if v_line.due_rule is null
      or v_line.due_rule not in ('on_period_start', 'on_period_end', 'after_days') then
      raise exception 'Invalid renewal fee due rule' using errcode = '22023';
    end if;

    if v_line.due_rule = 'after_days'
      and (v_line.due_days is null or v_line.due_days < 0) then
      raise exception 'Renewal fee due days are required' using errcode = '22023';
    end if;

    if v_line.due_rule <> 'after_days' and v_line.due_days is not null then
      raise exception 'Due days are only allowed for after-days due rules'
        using errcode = '22023';
    end if;

    insert into public.contract_version_lines (
      contract_version_id,
      direction,
      name,
      quantity,
      unit_price,
      billing_type,
      billing_unit,
      billing_interval,
      charge_date,
      due_rule,
      due_days,
      start_date,
      end_date,
      sort_order
    )
    values (
      v_new_version_id,
      v_line.direction::public.contract_cashflow_direction,
      btrim(v_line.name),
      v_line.quantity,
      v_line.unit_price,
      v_line.billing_type::public.contract_billing_type,
      case
        when v_line.billing_type = 'recurring'
        then v_line.billing_unit::public.contract_billing_unit
        else null
      end,
      case
        when v_line.billing_type = 'recurring' then v_line.billing_interval
        else null
      end,
      case
        when v_line.billing_type = 'one_time' then p_start_date
        else null
      end,
      v_line.due_rule::public.contract_due_rule,
      case
        when v_line.due_rule = 'after_days' then v_line.due_days
        else null
      end,
      p_start_date,
      p_end_date,
      (select count(*)::integer from public.contract_version_lines existing
       where existing.contract_version_id = v_new_version_id)
    );
  end loop;

  update public.contracts
  set
    end_date = p_end_date,
    status = 'active',
    updated_at = timezone('utc', now())
  where id = p_contract_id;

  v_generated_charge_count := coalesce(
    public.ensure_contract_charges(p_tenant_id, current_date),
    0
  );

  return jsonb_build_object(
    'contractId', p_contract_id,
    'versionId', v_new_version_id,
    'versionNo', v_next_version_no,
    'versionKind', 'renewal',
    'status', 'active',
    'effectiveFrom', p_start_date,
    'effectiveTo', p_end_date,
    'generatedChargeCount', v_generated_charge_count,
    'overrodeDraft', false
  );
end;
$$;

create or replace function public.renew_contracts_scoped(
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
  v_existing_draft record;
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
    limit 1
    for update;

    if not found then
      raise exception 'Contract has no effective version' using errcode = 'P0002';
    end if;

    select version.*
    into v_existing_draft
    from public.contract_versions version
    where version.contract_id = v_contract.id
      and version.status = 'draft'
      and version.version_kind = 'renewal'
    order by version.version_no desc
    limit 1
    for update;

    if v_existing_draft.id is not null and not p_override_draft then
      raise exception 'Contract has an existing draft renewal; confirmation required'
        using errcode = 'P0001';
    end if;

    if v_existing_draft.id is not null then
      delete from public.contract_versions
      where id = v_existing_draft.id;
      v_overrode_draft_count := v_overrode_draft_count + 1;
    end if;

    v_start_date := coalesce(
      greatest(v_current_version.effective_to, v_contract.end_date) + 1,
      current_date
    );
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

    v_item := public.renew_contract_active_scoped(
      p_tenant_id,
      v_contract.id,
      v_start_date,
      v_end_date,
      v_lines
    );

    v_item := jsonb_set(
      v_item,
      '{overrodeDraft}',
      to_jsonb(v_existing_draft.id is not null),
      true
    );
    v_items := v_items || jsonb_build_array(v_item);
  end loop;

  if v_processed_count <> v_requested_count then
    raise exception 'One or more contracts were not found' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'items', v_items,
    'total', jsonb_array_length(v_items),
    'overrodeDraftCount', v_overrode_draft_count
  );
end;
$$;

revoke execute on function public.renew_contract_active_scoped(uuid, uuid, date, date, jsonb)
  from public, anon;
grant execute on function public.renew_contract_active_scoped(uuid, uuid, date, date, jsonb)
  to authenticated;

revoke execute on function public.renew_contracts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) from public, anon;
grant execute on function public.renew_contracts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) to authenticated;

notify pgrst, 'reload schema';
