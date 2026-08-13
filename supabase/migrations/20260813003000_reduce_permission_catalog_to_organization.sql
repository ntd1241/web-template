-- Project thật hiện mới có phạm vi tổ chức và nhân viên.
-- Giữ các role để tiếp tục demo, nhưng thay toàn bộ catalog quyền bằng
-- những năng lực đã có trong product foundation.

delete from public.role_permissions
where permission_code not in (
  'organization:tenant:view',
  'organization:tenant:update',
  'organization:employee:view',
  'organization:employee:create',
  'organization:employee:update',
  'organization:employee:delete',
  'organization:employee:assign-role'
);

delete from public.user_permission_overrides
where permission_code not in (
  'organization:tenant:view',
  'organization:tenant:update',
  'organization:employee:view',
  'organization:employee:create',
  'organization:employee:update',
  'organization:employee:delete',
  'organization:employee:assign-role'
);

delete from public.permission_definitions
where code not in (
  'organization:tenant:view',
  'organization:tenant:update',
  'organization:employee:view',
  'organization:employee:create',
  'organization:employee:update',
  'organization:employee:delete',
  'organization:employee:assign-role'
);

-- Các permission mới được liên kết group_id ở cuối migration sau khi group
-- đã được tạo. Cho phép tạo bản ghi tạm thời trong bước seed.
alter table public.permission_definitions
  alter column group_id drop not null;

delete from public.permission_groups
where module_code <> 'organization';

delete from public.permission_modules
where code <> 'organization';

insert into public.permission_modules (code, name, description, sort_order, is_active)
values (
  'organization',
  'Tổ chức',
  'Quản lý thông tin tổ chức, thành viên và phân quyền trong tenant',
  10,
  true
)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_groups (
  module_code, code, name, description, sort_order, is_active
)
values
  (
    'organization',
    'tenant',
    'Thông tin tổ chức',
    'Thông tin và cấu hình cơ bản của tenant',
    10,
    true
  ),
  (
    'organization',
    'employees',
    'Nhân viên',
    'Danh sách thành viên, tài khoản và vai trò trong tổ chức',
    20,
    true
  )
on conflict (module_code, code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

insert into public.permission_definitions (
  code,
  module_code,
  group_name,
  name,
  action,
  sensitive,
  sort_order,
  is_active
)
values
  (
    'organization:tenant:view',
    'organization',
    'Thông tin tổ chức',
    'Xem thông tin tổ chức',
    'view',
    false,
    10,
    true
  ),
  (
    'organization:tenant:update',
    'organization',
    'Thông tin tổ chức',
    'Chỉnh sửa thông tin tổ chức',
    'update',
    false,
    20,
    true
  ),
  (
    'organization:employee:view',
    'organization',
    'Nhân viên',
    'Xem danh sách nhân viên',
    'view',
    false,
    30,
    true
  ),
  (
    'organization:employee:create',
    'organization',
    'Nhân viên',
    'Thêm nhân viên',
    'create',
    false,
    40,
    true
  ),
  (
    'organization:employee:update',
    'organization',
    'Nhân viên',
    'Chỉnh sửa nhân viên',
    'update',
    false,
    50,
    true
  ),
  (
    'organization:employee:delete',
    'organization',
    'Nhân viên',
    'Xóa nhân viên',
    'delete',
    true,
    60,
    true
  ),
  (
    'organization:employee:assign-role',
    'organization',
    'Nhân viên',
    'Gán vai trò cho nhân viên',
    'assign',
    true,
    70,
    true
  )
on conflict (code) do update set
  module_code = excluded.module_code,
  group_name = excluded.group_name,
  name = excluded.name,
  action = excluded.action,
  sensitive = excluded.sensitive,
  sort_order = excluded.sort_order,
  is_active = true;

update public.permission_definitions definition
set
  group_id = permission_group.id,
  tags = case definition.action
    when 'view' then array['Xem']::text[]
    when 'delete' then array['Xóa']::text[]
    when 'assign' then array['Chỉnh sửa', 'Duyệt']::text[]
    else array['Chỉnh sửa']::text[]
  end
from public.permission_groups permission_group
where definition.module_code = 'organization'
  and permission_group.module_code = 'organization'
  and permission_group.name = definition.group_name;

update public.permission_modules
set is_active = false
where code <> 'organization';

update public.permission_groups
set is_active = false
where module_code <> 'organization';

update public.permission_definitions
set is_active = false
where module_code <> 'organization';

-- Admin là user mẫu hiện tại, nhận toàn bộ quyền đang có của catalog mới.
insert into public.role_permissions (role_id, permission_code)
select role_record.id, definition.code
from public.roles role_record
cross join public.permission_definitions definition
where role_record.code = 'admin'
  and definition.module_code = 'organization'
  and definition.is_active
on conflict do nothing;
