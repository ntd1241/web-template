-- Seed unlinked employees for the current demo tenant so the responsible
-- employee assignment UI has enough data to exercise search, accordion cards,
-- avatar stacking, and overflow states.
with demo_tenant as (
  select id
  from public.tenants
  where name = 'Công ty TNHH Vacom'
    and status = 'active'
  order by created_at
  limit 1
), seed_employees(
  employee_code,
  first_name,
  last_name,
  job_title,
  department,
  joined_at
) as (
  values
    ('NV-DEMO-01', 'Minh', 'Nguyễn', 'Chuyên viên hợp đồng', 'Kinh doanh', date '2026-01-06'),
    ('NV-DEMO-02', 'Linh', 'Trần', 'Chuyên viên hợp đồng', 'Kinh doanh', date '2026-01-13'),
    ('NV-DEMO-03', 'Huy', 'Lê', 'Trưởng nhóm kinh doanh', 'Kinh doanh', date '2026-01-20'),
    ('NV-DEMO-04', 'Thảo', 'Phạm', 'Kế toán công nợ', 'Kế toán', date '2026-02-02'),
    ('NV-DEMO-05', 'Quân', 'Hoàng', 'Kế toán thanh toán', 'Kế toán', date '2026-02-09'),
    ('NV-DEMO-06', 'Vy', 'Võ', 'Chuyên viên chăm sóc khách hàng', 'Dịch vụ khách hàng', date '2026-02-16'),
    ('NV-DEMO-07', 'Nam', 'Đặng', 'Chuyên viên chăm sóc khách hàng', 'Dịch vụ khách hàng', date '2026-02-23'),
    ('NV-DEMO-08', 'Hà', 'Bùi', 'Trưởng nhóm vận hành', 'Vận hành', date '2026-03-02'),
    ('NV-DEMO-09', 'Khoa', 'Đỗ', 'Chuyên viên vận hành', 'Vận hành', date '2026-03-09'),
    ('NV-DEMO-10', 'Ngọc', 'Ngô', 'Chuyên viên pháp chế', 'Pháp chế', date '2026-03-16'),
    ('NV-DEMO-11', 'Tú', 'Dương', 'Chuyên viên pháp chế', 'Pháp chế', date '2026-03-23'),
    ('NV-DEMO-12', 'Mai', 'Vũ', 'Trợ lý quản lý', 'Điều hành', date '2026-04-06')
)
insert into public.employees (
  tenant_id,
  user_id,
  employee_code,
  first_name,
  last_name,
  job_title,
  department,
  phone,
  status,
  joined_at,
  note
)
select
  demo_tenant.id,
  null,
  seed.employee_code,
  seed.first_name,
  seed.last_name,
  seed.job_title,
  seed.department,
  '',
  'active',
  seed.joined_at,
  'Nhân viên demo phục vụ kiểm thử phân công hợp đồng.'
from demo_tenant
cross join seed_employees seed
on conflict (tenant_id, employee_code) do nothing;
