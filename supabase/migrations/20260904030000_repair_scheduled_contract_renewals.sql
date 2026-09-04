-- Repair renewals that were marked effective before their effective date.
-- Keep the earliest future renewal as the single pending renewal.

update public.contract_versions
set status = 'scheduled',
    updated_at = timezone('utc', now())
where status = 'effective'
  and version_kind = 'renewal'
  and effective_from > current_date;

with duplicate_scheduled as (
  select
    version.id,
    row_number() over (
      partition by version.contract_id
      order by version.effective_from, version.version_no, version.id
    ) as sequence_no
  from public.contract_versions version
  where version.status = 'scheduled'
    and version.version_kind = 'renewal'
    and version.effective_from > current_date
)
update public.contract_versions version
set status = 'cancelled',
    published_at = null,
    updated_at = timezone('utc', now())
from duplicate_scheduled duplicate
where version.id = duplicate.id
  and duplicate.sequence_no > 1;

with current_versions as (
  select
    version.id,
    row_number() over (
      partition by version.contract_id
      order by version.effective_from desc, version.version_no desc
    ) as sequence_no
  from public.contract_versions version
  where version.status = 'superseded'
    and version.effective_from <= current_date
    and (version.effective_to is null or version.effective_to >= current_date)
)
update public.contract_versions version
set status = 'effective',
    updated_at = timezone('utc', now())
from current_versions current_version
where version.id = current_version.id
  and current_version.sequence_no = 1;

create unique index if not exists contract_versions_one_scheduled_renewal_idx
  on public.contract_versions(contract_id)
  where status = 'scheduled' and version_kind = 'renewal';

notify pgrst, 'reload schema';
