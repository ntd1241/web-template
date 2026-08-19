# Stack And Architecture

Read this for feature boundaries, data flow, or setup decisions. For UI-only work, start from
[`docs/README.md`](./README.md) instead. Current code and `package.json` win over this document.

## Current Stack

| Concern      | Choice                                 | Source                                        |
| ------------ | -------------------------------------- | --------------------------------------------- |
| Build        | Vite                                   | `vite.config.ts`                              |
| UI           | React 19, TypeScript strict            | `src/`, `tsconfig.app.json`                   |
| Styling      | Tailwind CSS 4 via `@tailwindcss/vite` | `src/styles/globals.css`                      |
| Routing      | React Router declarative routes        | `src/routing/app-routing-setup.tsx`           |
| Server state | TanStack React Query                   | `src/lib/query-client.ts`                     |
| Client state | Zustand                                | `src/stores/`                                 |
| HTTP         | Axios                                  | `src/lib/axios.ts`                            |
| Forms        | react-hook-form and zod                | feature schemas, `src/components/ui/form.tsx` |
| i18n         | react-intl, Vietnamese default         | `src/i18n/`                                   |
| Testing      | Vitest and Testing Library             | `vitest.config.ts`, `src/test/`               |

Exact versions belong in `package.json`, not duplicated here.

## Application Boundaries

- `src/providers/`: app-wide providers and startup composition.
- `src/config/`: validated environment access.
- `src/lib/`: shared clients and domain-neutral utilities.
- `src/constants/`: route and query-key contracts.
- `src/stores/`: genuinely global client state such as auth and shell UI.
- `src/components/ui/`: shared UI primitives and component defaults.
- `src/components/layouts/`: Metronic and app-shell layouts.
- `src/features/<domain>/`: production domain features.
- `src/examples/<domain>/`: dev-only reference features, excluded from production.
- `src/builders/`: build-time UI scaffold generators; see [`src/builders/README.md`](../src/builders/README.md).
- `supabase/`: temporary Supabase migrations and setup notes for the real project.

### User and tenant context

- `UserProvider` (`src/providers/user-provider.tsx`) là lớp đọc session/auth từ
  Zustand và cung cấp `user`, `userId`, token state cùng các auth action cho
  component React.
- `TenantProvider` (`src/providers/tenant-provider.tsx`) là nguồn tenant hiện
  tại dùng chung toàn app. Dữ liệu tenant/role là server state nên nằm trong
  React Query, không nhân bản vào Zustand.
- Feature API nên nhận `tenantId` đã lấy từ `useTenant()` khi gọi từ React.
  Tham số override tùy chọn chỉ giữ compatibility cho các caller ngoài React;
  không nên tự gọi `/tenant_members` trong từng page, hook hoặc selector.

### Hai vùng ứng dụng trong cùng một project

Project hiện được chia thành hai vùng để vừa phát triển sản phẩm thật vừa đối
chiếu với các màn hình mẫu:

- **Project thật**: route ở root (`/` và các route nghiệp vụ thật phát triển về
  sau), dùng menu và sidebar riêng tại `src/config/project-menu.config.tsx`.
- **Example**: toàn bộ màn hình tham chiếu nằm dưới namespace `/example/*`,
  dùng menu example tại `src/config/menu.config.tsx` và đăng ký route tập trung
  ở `src/examples/example-routes.tsx`.

Khi thêm chức năng thật, ưu tiên đặt code trong `src/features/` hoặc thư mục
project tương ứng và đăng ký vào route/menu của project thật. Không trộn route
hoặc menu example vào project thật. Khi bàn giao, có thể gỡ example bằng cách
loại bỏ đăng ký `exampleRoutes` và thư mục `src/examples/` mà không ảnh hưởng
đến shell, component dùng chung và route thật.

Do not relocate existing Metronic layout modules merely to match feature-first structure.

## Data Flow

```text
Page or feature component
  -> feature hook
  -> React Query query/mutation
  -> feature API module
  -> mock response or Axios client
  -> backend
```

- Components do not call Axios directly.
- Server state stays in React Query, not Zustand.
- Feature-local UI state stays local.
- Global stores contain only cross-feature client state.
- Chỉ dùng `useUser()` và `useTenant()` để đọc session/tenant trong component;
  `useAuthStore` trực tiếp chỉ dành cho startup adapter không chạy trong React.
- API errors are normalized at the client boundary and surfaced through query/mutation state.

### HTTP client conventions

`src/lib/axios.ts` là HTTP boundary duy nhất cho REST API của project. Feature API
chỉ gọi instance `api`, không đọc `import.meta.env` hoặc tạo Axios instance riêng.

Supabase tạm thời dùng cùng nền Axios qua `src/lib/supabase.ts`, gọi PostgREST
với publishable/anon key và user JWT. RLS trong database là lớp bảo vệ chính;
không đưa `service_role` key vào frontend. Chi tiết migration tenant nằm ở
[`supabase/README.md`](../supabase/README.md).

- `VITE_API_URL` và `VITE_API_TIMEOUT_MS` được đọc qua `src/config/env.ts`.
- Request object JSON tự nhận `Content-Type`; `FormData`, file và query params
  không bị ép thành JSON để giữ nguyên cơ chế multipart của trình duyệt.
- Token được lấy qua auth getter đã cấu hình trước khi app render; không đọc
  localStorage trực tiếp trong Axios interceptor.
- Query function nên nhận `signal` từ TanStack Query và truyền tiếp vào Axios
  để hủy request khi query cũ không còn cần thiết. Mock response cũng hỗ trợ
  `AbortSignal` để behavior giữa mock và API thật nhất quán.
- Response lỗi được chuẩn hóa thành `ApiError`, giữ status, code, field errors,
  request id và thông tin timeout/network. Toast lỗi xử lý ở query/mutation
  boundary; interceptor không tự hiển thị toast.
- Refresh-token queue chỉ nên thêm sau khi backend chốt contract refresh token;
  khi triển khai, cần bảo đảm nhiều request `401` dùng chung một lần refresh.

## Add Or Extend A Feature

Inspect the existing feature first; create only the layers the task needs. The usual order is:

1. Model and DTO types.
2. Zod schema and inferred values.
3. API functions with existing mock/real behavior.
4. Query and mutation hooks with stable query keys.
5. Feature hooks for filters, pagination, or orchestration.
6. UI generated and composed through [`workflows/implement-ui.md`](./workflows/implement-ui.md).
7. Thin page composition and route registration.
8. Focused tests for changed behavior.

Page states such as loading, empty, error, and permissions are added when the feature contract requires
them. Do not load permission docs for features without permission behavior.

## Commands

```bash
npm run dev
npm run build
npm run test
npm run test:run
npm run lint
npm run format
```

`npm run lint` and `npm run format` write files. Use them only when those edits are intended.

## Environment

Declare Vite environment types in `src/vite-env.d.ts`, access them through `src/config/env.ts`, and keep
local secrets in `.env.local`. `.env.example` documents supported variables.
