-- Keep the payment reminder window at tenant scope so it applies to every
-- account in the organization and every contract owned by that tenant.
update public.tenants
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{paymentReminderDays}',
  '7'::jsonb,
  true
)
where not (coalesce(settings, '{}'::jsonb) ? 'paymentReminderDays');
