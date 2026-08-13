# Supabase tạm thời cho project thật

Project dùng Supabase PostgREST qua Axios tại
[`src/lib/supabase.ts`](../src/lib/supabase.ts), không dùng `service_role` ở
frontend.

## Cấu hình local

Sao chép `.env.example` thành `.env.local` và điền:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>
VITE_SUPABASE_SCHEMA=public
```

Publishable/anon key có thể xuất hiện trong bundle browser. Quyền truy cập dữ
liệu phải được bảo vệ bằng Postgres Row Level Security; không dùng
`service_role` key trong `VITE_*`.

## Migration tenant

Chạy migration
[`20260812000000_create_tenants.sql`](./migrations/20260812000000_create_tenants.sql)
trong Supabase SQL Editor hoặc qua Supabase CLI. Migration tạo:

- `tenants`: thông tin tenant, plan, trạng thái, settings và metadata.
- `tenant_members`: liên kết user với tenant và role owner/admin/member.
- `user_profiles`: hồ sơ ứng dụng dùng chung, liên kết 1:1 với `auth.users`.
- helper functions cho membership/role checks.
- RPC `create_tenant` để tạo tenant và owner membership trong cùng transaction.
- RLS: user chỉ đọc tenant/member record mình thuộc về; owner/admin mới được
  cập nhật tenant và quản lý membership.

## Model user

Không tạo một user riêng cho từng tenant:

- `auth.users` là identity đăng nhập toàn cục của Supabase Auth. Email, phone
  và các timestamp đăng nhập do Auth làm nguồn sự thật.
- `user_profiles` lưu thông tin hồ sơ dùng chung như tên, avatar, locale và
  tùy chọn hiển thị. Trigger tự tạo profile sau signup và migration backfill
  các Auth user đã tồn tại.
- `tenant_members` liên kết một Auth user với từng tenant, đồng thời lưu các
  dữ liệu theo tenant như role và trạng thái membership.

Như vậy một người chỉ có một tài khoản đăng nhập nhưng có thể thuộc nhiều
tenant với role khác nhau. Model frontend biểu diễn user hiện tại bằng
`CurrentUser.auth` + `CurrentUser.profile`.

Frontend dùng model camelCase trong
[`src/features/tenants/model/tenant.ts`](../src/features/tenants/model/tenant.ts),
còn `TenantRow`/`TenantMemberRow` giữ nguyên snake_case của PostgREST và mapper
đổi về domain model.

## Phân quyền tenant

Migration `20260813000000_create_tenant_permissions.sql` tạo catalog quyền dùng
chung, role theo tenant, liên kết role với thành viên và override riêng cho user:

- `permission_definitions`: danh mục quyền ổn định theo mã `resource:action`.
- `permission_modules` và `permission_groups`: cấu trúc hiển thị module/nhóm quyền,
  không còn phụ thuộc vào mock ở frontend.
- `roles` và `role_permissions`: role nghiệp vụ thuộc từng tenant.
- `tenant_member_roles`: một user có thể có nhiều role trong một tenant.
- `user_permission_overrides`: chỉ lưu ngoại lệ `allow` hoặc `deny`, không sao chép
  toàn bộ quyền của role.

Catalog hiện tại của project thật chỉ có module `Tổ chức`, gồm hai nhóm `Thông tin
tổ chức` và `Nhân viên`. Khi thêm nghiệp vụ mới, tạo migration bổ sung module/nhóm
thay vì đưa quyền mock vào frontend.

Quyền hiệu lực được tính theo công thức:

```text
(quyền từ role OR override allow) AND NOT override deny
```

Vì vậy khi role được cập nhật, user vẫn nhận quyền mới của role; chỉ các quyền có
override mới giữ khác biệt. Các RPC `get_effective_permissions` và
`has_tenant_permission` là nguồn dùng chung cho kiểm tra quyền, còn RLS vẫn là
lớp bảo vệ cuối cùng. `ensure_tenant_permission_defaults` khởi tạo bốn role mẫu
cho tenant khi trang phân quyền được mở lần đầu.

## Hệ thống nhãn dùng chung

Migration `20260813100000_create_tagging_system.sql` tạo:

- `tag_groups`: nhóm nhãn theo tenant.
- `tags`: nhãn thuộc một nhóm, dùng chung cho nhiều loại đối tượng.
- `tag_assignments`: liên kết polymorphic theo `subject_type` và `subject_id`,
  nên một nhân viên, khách hàng hoặc đối tượng nghiệp vụ khác có thể có nhiều
  nhãn mà không cần tạo bảng pivot riêng cho từng loại.
- RPC `replace_tag_assignments`: thay toàn bộ nhãn của một đối tượng trong một
  transaction và chỉ cho phép owner/admin của tenant thực hiện.

Frontend dùng `src/project/tags/api/tags.api.ts` làm lớp API duy nhất cho nhóm
nhãn, nhãn và assignment. Khi thêm loại đối tượng mới, chỉ cần dùng lại
`replaceSubjectTags(tenantId, subjectType, subjectId, tagIds)` và giữ nguyên
model database.
