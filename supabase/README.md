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
- helper functions cho membership/role checks.
- RPC `create_tenant` để tạo tenant và owner membership trong cùng transaction.
- RLS: user chỉ đọc tenant/member record mình thuộc về; owner/admin mới được
  cập nhật tenant và quản lý membership.

Frontend dùng model camelCase trong
[`src/features/tenants/model/tenant.ts`](../src/features/tenants/model/tenant.ts),
còn `TenantRow`/`TenantMemberRow` giữ nguyên snake_case của PostgREST và mapper
đổi về domain model.
