create table if not exists public.regions (
  country_code text not null,
  code text not null,
  name text not null,
  level text not null,
  parent_code text,
  is_active boolean not null default true,
  valid_from date,
  valid_to date,
  source_version text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (country_code, code),
  constraint regions_country_code_format check (country_code ~ '^[A-Z]{2}$'),
  constraint regions_level_check check (level in ('province', 'state', 'region'))
);

create index if not exists regions_lookup_idx
  on public.regions(country_code, level, is_active, name);

create trigger regions_set_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

grant select on public.regions to authenticated;

insert into public.regions (
  country_code, code, name, level, source_version
)
values
  ('VN', '01', 'Thành phố Hà Nội', 'province', '19/2025/QĐ-TTg'),
  ('VN', '04', 'Tỉnh Cao Bằng', 'province', '19/2025/QĐ-TTg'),
  ('VN', '08', 'Tỉnh Tuyên Quang', 'province', '19/2025/QĐ-TTg'),
  ('VN', '11', 'Tỉnh Điện Biên', 'province', '19/2025/QĐ-TTg'),
  ('VN', '12', 'Tỉnh Lai Châu', 'province', '19/2025/QĐ-TTg'),
  ('VN', '14', 'Tỉnh Sơn La', 'province', '19/2025/QĐ-TTg'),
  ('VN', '15', 'Tỉnh Lào Cai', 'province', '19/2025/QĐ-TTg'),
  ('VN', '19', 'Tỉnh Thái Nguyên', 'province', '19/2025/QĐ-TTg'),
  ('VN', '20', 'Tỉnh Lạng Sơn', 'province', '19/2025/QĐ-TTg'),
  ('VN', '22', 'Tỉnh Quảng Ninh', 'province', '19/2025/QĐ-TTg'),
  ('VN', '24', 'Tỉnh Bắc Ninh', 'province', '19/2025/QĐ-TTg'),
  ('VN', '25', 'Tỉnh Phú Thọ', 'province', '19/2025/QĐ-TTg'),
  ('VN', '31', 'Thành phố Hải Phòng', 'province', '19/2025/QĐ-TTg'),
  ('VN', '33', 'Tỉnh Hưng Yên', 'province', '19/2025/QĐ-TTg'),
  ('VN', '37', 'Tỉnh Ninh Bình', 'province', '19/2025/QĐ-TTg'),
  ('VN', '38', 'Tỉnh Thanh Hóa', 'province', '19/2025/QĐ-TTg'),
  ('VN', '40', 'Tỉnh Nghệ An', 'province', '19/2025/QĐ-TTg'),
  ('VN', '42', 'Tỉnh Hà Tĩnh', 'province', '19/2025/QĐ-TTg'),
  ('VN', '44', 'Tỉnh Quảng Trị', 'province', '19/2025/QĐ-TTg'),
  ('VN', '46', 'Thành phố Huế', 'province', '19/2025/QĐ-TTg'),
  ('VN', '48', 'Thành phố Đà Nẵng', 'province', '19/2025/QĐ-TTg'),
  ('VN', '51', 'Tỉnh Quảng Ngãi', 'province', '19/2025/QĐ-TTg'),
  ('VN', '52', 'Tỉnh Gia Lai', 'province', '19/2025/QĐ-TTg'),
  ('VN', '56', 'Tỉnh Khánh Hòa', 'province', '19/2025/QĐ-TTg'),
  ('VN', '66', 'Tỉnh Đắk Lắk', 'province', '19/2025/QĐ-TTg'),
  ('VN', '68', 'Tỉnh Lâm Đồng', 'province', '19/2025/QĐ-TTg'),
  ('VN', '75', 'Tỉnh Đồng Nai', 'province', '19/2025/QĐ-TTg'),
  ('VN', '79', 'Thành phố Hồ Chí Minh', 'province', '19/2025/QĐ-TTg'),
  ('VN', '80', 'Tỉnh Tây Ninh', 'province', '19/2025/QĐ-TTg'),
  ('VN', '82', 'Tỉnh Đồng Tháp', 'province', '19/2025/QĐ-TTg'),
  ('VN', '86', 'Tỉnh Vĩnh Long', 'province', '19/2025/QĐ-TTg'),
  ('VN', '91', 'Tỉnh An Giang', 'province', '19/2025/QĐ-TTg'),
  ('VN', '92', 'Thành phố Cần Thơ', 'province', '19/2025/QĐ-TTg'),
  ('VN', '96', 'Tỉnh Cà Mau', 'province', '19/2025/QĐ-TTg')
on conflict (country_code, code) do update set
  name = excluded.name,
  level = excluded.level,
  source_version = excluded.source_version,
  is_active = true;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'address'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'customers'
      and column_name = 'address_detail'
  ) then
    alter table public.customers rename column address to address_detail;
  end if;
end;
$$;

alter table public.customers
  add column if not exists country_code text not null default 'VN',
  add column if not exists region_code text,
  add column if not exists region_name text not null default '',
  add column if not exists address_detail text not null default '';

alter table public.customers
  add constraint customers_country_code_format
  check (country_code ~ '^[A-Z]{2}$');

create index if not exists customers_tenant_country_region_idx
  on public.customers(tenant_id, country_code, region_code);

comment on column public.customers.country_code is
  'ISO 3166-1 alpha-2 country code for the customer address.';
comment on column public.customers.region_code is
  'Country-specific region code; for Vietnam this is the official province/city code.';
comment on column public.customers.region_name is
  'Region name snapshot, used for countries without an internal region catalog.';
comment on column public.customers.address_detail is
  'Street-level or free-form address details.';
