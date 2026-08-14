do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'customer_type'
  ) then
    alter table public.customers
      rename column customer_type to business_type;
  end if;

  if exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'customer_type'
  ) then
    alter type public.customer_type rename to business_type;
  end if;
end;
$$;
