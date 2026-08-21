-- Payment mutations must go through the contract-scoped wrapper so the
-- assigned employee permission and per-contract deny overrides are enforced.
revoke execute on function public.record_contract_period_payment(
  uuid,
  uuid,
  uuid,
  date,
  date,
  date,
  numeric,
  text,
  timestamptz,
  public.customer_payment_method,
  text,
  text,
  jsonb
) from authenticated;
