create or replace function public.create_contract_renewal_draft_scoped(
  p_tenant_id uuid,
  p_contract_id uuid,
  p_start_date date,
  p_end_date date,
  p_lines jsonb,
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
  v_draft_id uuid;
  v_draft_version_no integer;
  v_snapshot jsonb;
  v_line record;
  v_overrode_draft boolean := false;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  if not public.has_contract_permission(
    p_contract_id,
    'contracts:amend'
  ) then
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

  select version.*
  into v_existing_draft
  from public.contract_versions version
  where version.contract_id = p_contract_id
    and version.status = 'draft'
  order by version.version_no desc
  limit 1
  for update;

  if v_existing_draft.id is not null and not p_override_draft then
    raise exception 'Contract has an existing draft renewal; confirmation required'
      using errcode = 'P0001';
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

  v_snapshot := coalesce(v_current_version.terms_snapshot, '{}'::jsonb)
    || jsonb_build_object(
      'startDate', p_start_date::text,
      'endDate', p_end_date::text
    );

  if v_existing_draft.id is not null then
    v_draft_id := v_existing_draft.id;
    v_draft_version_no := v_existing_draft.version_no;
    v_overrode_draft := true;

    update public.contract_versions
    set
      status = 'draft',
      version_kind = 'renewal',
      effective_from = p_start_date,
      effective_to = p_end_date,
      change_reason = 'Gia hạn hợp đồng',
      terms_snapshot = v_snapshot,
      published_at = null,
      updated_at = timezone('utc', now())
    where id = v_draft_id;

    delete from public.contract_version_lines
    where contract_version_id = v_draft_id;
  else
    select coalesce(max(version.version_no), 0) + 1
    into v_draft_version_no
    from public.contract_versions version
    where version.contract_id = p_contract_id;

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
      v_draft_version_no,
      'draft',
      'renewal',
      p_start_date,
      p_end_date,
      'Gia hạn hợp đồng',
      v_snapshot,
      auth.uid(),
      null
    )
    returning id into v_draft_id;
  end if;

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
      v_draft_id,
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
       where existing.contract_version_id = v_draft_id)
    );
  end loop;

  return jsonb_build_object(
    'contractId', p_contract_id,
    'versionId', v_draft_id,
    'versionNo', v_draft_version_no,
    'versionKind', 'renewal',
    'status', 'draft',
    'effectiveFrom', p_start_date,
    'effectiveTo', p_end_date,
    'generatedChargeCount', 0,
    'overrodeDraft', v_overrode_draft
  );
end;
$$;

-- Keep the legacy RPC safe for older clients: renewal is now a draft action.
create or replace function public.renew_contract_scoped(
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
begin
  return public.create_contract_renewal_draft_scoped(
    p_tenant_id,
    p_contract_id,
    p_start_date,
    p_end_date,
    p_lines,
    false
  );
end;
$$;

revoke execute on function public.create_contract_renewal_draft_scoped(uuid, uuid, date, date, jsonb, boolean)
  from public, anon;
grant execute on function public.create_contract_renewal_draft_scoped(uuid, uuid, date, date, jsonb, boolean)
  to authenticated;

revoke execute on function public.renew_contract_scoped(uuid, uuid, date, date, jsonb)
  from public, anon;
grant execute on function public.renew_contract_scoped(uuid, uuid, date, date, jsonb)
  to authenticated;

notify pgrst, 'reload schema';
