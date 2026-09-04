-- A renewal with a future start date is published but scheduled. Keep the
-- current version effective until the scheduled start date, then activate it
-- from the daily contract lifecycle job.

alter type public.contract_version_status
  add value if not exists 'scheduled';

alter table public.contract_versions
  drop constraint if exists contract_versions_published_consistency_check;

alter table public.contract_versions
  add constraint contract_versions_published_consistency_check check (
    (status in ('effective', 'scheduled', 'superseded') and published_at is not null)
    or status in ('draft', 'cancelled')
  );

-- Repair future renewals created by the previous implementation: the current
-- version must remain effective until the new version's effective_from date.
update public.contract_versions scheduled_version
set status = 'scheduled'
where scheduled_version.status = 'effective'
  and scheduled_version.version_kind = 'renewal'
  and scheduled_version.effective_from > current_date;

update public.contract_versions current_version
set status = 'effective'
where current_version.status = 'superseded'
  and exists (
    select 1
    from public.contract_versions scheduled_version
    where scheduled_version.contract_id = current_version.contract_id
      and scheduled_version.version_kind = 'renewal'
      and scheduled_version.status = 'scheduled'
      and scheduled_version.version_no = current_version.version_no + 1
      and scheduled_version.effective_from > current_date
      and current_version.effective_to = scheduled_version.effective_from - 1
  );

-- Preserve the already deployed implementation as an internal helper. The
-- public active RPC below wraps it and converts the result into a scheduled
-- version without changing the existing validation or line-copying logic.
alter function public.renew_contract_active_scoped(uuid, uuid, date, date, jsonb)
  rename to renew_contract_effective_now_scoped;

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
  v_current_version_id uuid;
  v_result jsonb;
begin
  select version.id
  into v_current_version_id
  from public.contract_versions version
  where version.contract_id = p_contract_id
    and version.status = 'effective'
  order by version.version_no desc
  limit 1
  for update;

  if not found then
    raise exception 'Contract has no effective version' using errcode = 'P0002';
  end if;

  v_result := public.renew_contract_effective_now_scoped(
    p_tenant_id,
    p_contract_id,
    p_start_date,
    p_end_date,
    p_lines
  );

  update public.contract_versions
  set status = 'effective',
      updated_at = timezone('utc', now())
  where id = v_current_version_id
    and status = 'superseded';

  update public.contract_versions
  set status = 'scheduled',
      updated_at = timezone('utc', now())
  where id = (v_result ->> 'versionId')::uuid
    and status = 'effective';

  return jsonb_set(
    v_result,
    '{status}',
    to_jsonb('scheduled'::text),
    true
  );
end;
$$;

revoke execute on function public.renew_contract_effective_now_scoped(
  uuid, uuid, date, date, jsonb
) from public, anon, authenticated;

-- Do not create a second future renewal for a contract that already has one
-- waiting to take effect.
alter function public.renew_contracts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) rename to renew_contracts_effective_now_scoped;

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
  v_scheduled_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select count(*)::integer
  into v_scheduled_count
  from public.contract_versions version
  join public.contracts contract on contract.id = version.contract_id
  where contract.tenant_id = p_tenant_id
    and contract.id = any(p_contract_ids)
    and version.version_kind = 'renewal'
    and version.status = 'scheduled'
    and version.effective_from > current_date;

  if v_scheduled_count > 0 then
    raise exception 'Contract already has a scheduled renewal'
      using errcode = 'P0001';
  end if;

  return public.renew_contracts_effective_now_scoped(
    p_tenant_id,
    p_contract_ids,
    p_duration_value,
    p_duration_unit,
    p_fee_increase_percent,
    p_override_draft
  );
end;
$$;

-- Transition scheduled versions when their effective date arrives. This is
-- intentionally private; it is called by the existing global scheduler.
create or replace function public.activate_scheduled_contract_versions(
  p_run_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_version record;
  v_current_version record;
  v_activated_count integer := 0;
begin
  if p_run_date is null then
    raise exception 'run_date is required' using errcode = '22004';
  end if;

  for v_version in
    select version.id,
           version.contract_id,
           version.effective_from,
           contract.tenant_id
    from public.contract_versions version
    join public.contracts contract on contract.id = version.contract_id
    where version.status = 'scheduled'
      and version.effective_from is not null
      and version.effective_from <= p_run_date
    order by version.effective_from, version.version_no, version.id
    for update of version
  loop
    select version.*
    into v_current_version
    from public.contract_versions version
    where version.contract_id = v_version.contract_id
      and version.status = 'effective'
    order by version.version_no desc
    limit 1
    for update;

    if found then
      update public.contract_versions
      set status = 'superseded',
          effective_to = v_version.effective_from - 1,
          updated_at = timezone('utc', now())
      where id = v_current_version.id;
    end if;

    update public.contract_versions
    set status = 'effective',
        published_at = coalesce(published_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = v_version.id
      and status = 'scheduled';

    v_activated_count := v_activated_count + 1;
  end loop;

  return v_activated_count;
end;
$$;

revoke execute on function public.renew_contracts_effective_now_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) from public, anon, authenticated;

revoke execute on function public.renew_contract_active_scoped(
  uuid, uuid, date, date, jsonb
) from public, anon;
grant execute on function public.renew_contract_active_scoped(
  uuid, uuid, date, date, jsonb
) to authenticated;

revoke execute on function public.renew_contracts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) from public, anon;
grant execute on function public.renew_contracts_scoped(
  uuid, uuid[], integer, text, numeric, boolean
) to authenticated;

revoke execute on function public.activate_scheduled_contract_versions(date)
  from public, anon, authenticated;

-- Run scheduled lifecycle transitions before generating the day's charges.
create or replace function public.run_contract_charge_generation(
  p_run_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant record;
  v_inserted integer := 0;
begin
  if p_run_date is null then
    raise exception 'run_date is required' using errcode = '22004';
  end if;

  perform public.activate_scheduled_contract_versions(p_run_date);

  for v_tenant in
    select tenant.id
    from public.tenants tenant
    where tenant.status = 'active'
    order by tenant.id
  loop
    v_inserted := v_inserted + coalesce(
      public.ensure_contract_charges(v_tenant.id, p_run_date),
      0
    );
  end loop;

  return v_inserted;
end;
$$;

notify pgrst, 'reload schema';
