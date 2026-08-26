alter table public.contract_versions
  alter column effective_from drop not null;

alter table public.contract_versions
  drop constraint if exists contract_versions_date_range_check;

alter table public.contract_versions
  add constraint contract_versions_date_range_check check (
    (
      status = 'draft'
      and (
        effective_from is null
        or effective_to is null
        or effective_to >= effective_from
      )
    )
    or (
      status <> 'draft'
      and effective_from is not null
      and (effective_to is null or effective_to >= effective_from)
    )
  );

-- Drafts previously received an automatic date during save. They are not
-- scheduled versions, so clear that derived value before the new semantics
-- start treating draft dates as explicit user input.
update public.contract_versions
set effective_from = null
where status = 'draft';

create unique index if not exists contract_versions_one_draft_per_contract_idx
  on public.contract_versions(contract_id)
  where status = 'draft';
