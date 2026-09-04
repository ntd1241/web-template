-- Commit the enum value before migrations that use it in constraints and data.
alter type public.contract_version_status
  add value if not exists 'scheduled';
