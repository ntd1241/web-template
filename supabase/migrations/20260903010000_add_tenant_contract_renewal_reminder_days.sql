-- Configure contract renewal reminders at organization scope so the contract
-- list uses the same threshold for every contract in the tenant.
update public.tenants
set settings = jsonb_set(
  coalesce(settings, '{}'::jsonb),
  '{contractRenewalReminderDays}',
  '30'::jsonb,
  true
)
where not (
  coalesce(settings, '{}'::jsonb) ? 'contractRenewalReminderDays'
);
