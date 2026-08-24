alter table public.tenants
  alter column settings set default jsonb_build_object(
    'numberLocale', 'vi-VN',
    'compactDisplay', 'long'
  );

update public.tenants
set settings = jsonb_set(
  jsonb_set(
    coalesce(settings, '{}'::jsonb),
    '{numberLocale}',
    to_jsonb(
      case
        when settings ->> 'numberLocale' in ('vi-VN', 'en-US')
          then settings ->> 'numberLocale'
        else 'vi-VN'
      end
    ),
    true
  ),
  '{compactDisplay}',
  to_jsonb(
    case
      when settings ->> 'compactDisplay' in ('long', 'short')
        then settings ->> 'compactDisplay'
      else 'long'
    end
  ),
  true
);

comment on column public.tenants.settings is
  'Tenant settings. Number format settings always include numberLocale and compactDisplay.';
