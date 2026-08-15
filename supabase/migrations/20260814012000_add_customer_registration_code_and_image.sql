alter table public.customers
  add column if not exists business_registration_code text not null default '',
  add column if not exists image_url text;

comment on column public.customers.business_registration_code is
  'Mã định danh pháp lý của khách hàng: mã số thuế, mã QHNS hoặc mã số đăng ký kinh doanh.';
comment on column public.customers.image_url is
  'URL ảnh đại diện khách hàng trong storage tenant-assets.';
