-- Charge generation is a database responsibility. Keep one global scheduler
-- and let the idempotent tenant-scoped function process all active tenants.

create extension if not exists pg_cron;

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

revoke execute on function public.run_contract_charge_generation(date)
  from public, anon, authenticated;
revoke execute on function public.ensure_contract_charges(uuid, date)
  from authenticated;

create or replace function public.generate_contract_charges_on_lifecycle_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'contracts' and new.status = 'active' then
    perform public.ensure_contract_charges(new.tenant_id, current_date);
  elsif tg_table_name = 'contract_versions' and new.status = 'effective' then
    perform public.ensure_contract_charges(
      (select contract.tenant_id from public.contracts contract where contract.id = new.contract_id),
      current_date
    );
  end if;

  return new;
end;
$$;

drop trigger if exists contracts_generate_charges_on_activation
  on public.contracts;
create trigger contracts_generate_charges_on_activation
after update of status on public.contracts
for each row
when (new.status = 'active' and old.status is distinct from new.status)
execute function public.generate_contract_charges_on_lifecycle_change();

drop trigger if exists contract_versions_generate_charges_on_publish
  on public.contract_versions;
create trigger contract_versions_generate_charges_on_publish
after update of status on public.contract_versions
for each row
when (new.status = 'effective' and old.status is distinct from new.status)
execute function public.generate_contract_charges_on_lifecycle_change();

do $schedule$
declare
  v_job_id bigint;
begin
  select jobid
  into v_job_id
  from cron.job
  where jobname = 'contract-charge-generation-daily';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'contract-charge-generation-daily',
    '0 1 * * *',
    $$select public.run_contract_charge_generation(current_date);$$
  );
end;
$schedule$;
