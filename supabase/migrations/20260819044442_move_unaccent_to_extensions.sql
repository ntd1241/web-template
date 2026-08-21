alter extension unaccent set schema extensions;

alter function public.list_contract_receivable_periods(
  uuid, uuid, integer, integer, text, text, text, integer
) set search_path = public, extensions;
