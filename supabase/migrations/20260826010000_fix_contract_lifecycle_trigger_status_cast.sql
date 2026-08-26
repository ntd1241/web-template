create or replace function public.generate_contract_charges_on_lifecycle_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'contracts' then
    if new.status::text = 'active' then
      perform public.ensure_contract_charges(new.tenant_id, current_date);
    end if;
  elsif tg_table_name = 'contract_versions' then
    if new.status::text = 'effective' then
      perform public.ensure_contract_charges(
        (select contract.tenant_id
         from public.contracts contract
         where contract.id = new.contract_id),
        current_date
      );
    end if;
  end if;

  return new;
end;
$$;
