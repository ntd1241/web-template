drop function if exists public.list_contracts(
  uuid,
  integer,
  integer,
  text,
  public.contract_status,
  uuid,
  text,
  numeric,
  numeric,
  date,
  date,
  public.contract_status[]
);

notify pgrst, 'reload schema';
