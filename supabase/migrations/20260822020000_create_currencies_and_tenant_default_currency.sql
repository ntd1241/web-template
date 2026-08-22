create table public.currencies (
  code text primary key,
  name_vi text not null,
  name_en text not null,
  symbol text not null,
  minor_unit smallint not null default 0,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  constraint currencies_code_format check (code ~ '^[A-Z]{3}$'),
  constraint currencies_minor_unit_range check (minor_unit between 0 and 4)
);

comment on table public.currencies is 'System currency catalog. Deactivate currencies instead of deleting them.';

insert into public.currencies (code, name_vi, name_en, symbol, minor_unit, sort_order)
values
  ('VND', 'Việt Nam đồng', 'Vietnamese đồng', '₫', 0, 10),
  ('USD', 'Đô la Mỹ', 'United States dollar', '$', 2, 20),
  ('EUR', 'Euro', 'Euro', '€', 2, 30)
on conflict (code) do update
set
  name_vi = excluded.name_vi,
  name_en = excluded.name_en,
  symbol = excluded.symbol,
  minor_unit = excluded.minor_unit,
  sort_order = excluded.sort_order;

alter table public.tenants
  add column default_currency_code text;

update public.tenants
set default_currency_code = case
  when upper(btrim(settings ->> 'currencyCode')) ~ '^[A-Z]{3}$'
    and exists (
      select 1
      from public.currencies
      where code = upper(btrim(settings ->> 'currencyCode'))
    )
    then upper(btrim(settings ->> 'currencyCode'))
  else 'VND'
end
where default_currency_code is null;

alter table public.tenants
  alter column default_currency_code set default 'VND',
  alter column default_currency_code set not null;

alter table public.tenants
  add constraint tenants_default_currency_code_fkey
  foreign key (default_currency_code)
  references public.currencies(code)
  on update cascade
  on delete restrict;

create index tenants_default_currency_code_idx
  on public.tenants(default_currency_code);

alter table public.currencies enable row level security;

create policy "Authenticated users can view currencies"
on public.currencies
for select
to authenticated
using (true);
