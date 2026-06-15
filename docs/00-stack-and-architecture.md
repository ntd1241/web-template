# Stack & Architecture (Source of Truth)

> **Đọc file này đầu tiên.** Đây là mô tả **thực tế** của stack và app foundation sau khi setup.
> Khi bất kỳ doc nào khác mâu thuẫn với file này hoặc với code, **code thắng**, rồi tới file này.

---

## 1. Tech Stack (thực tế đang dùng)

| Lớp                 | Lựa chọn                                            | Ghi chú                                                                                                   |
| ------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Build               | **Vite 7**                                          | `vite.config.ts`; test: `vitest.config.ts`                                                                |
| UI runtime          | **React 19**                                        | function component, named export                                                                          |
| Ngôn ngữ            | **TypeScript 5** (strict)                           | `tsconfig.app.json` đã bật `strict`, `noUnusedLocals/Parameters`                                          |
| CSS                 | **Tailwind CSS 4** qua `@tailwindcss/vite`          | **Không có `tailwind.config.*`** — token khai báo bằng `@theme` trong `src/styles/globals.css`            |
| Routing             | **React Router 7** (declarative `<Routes>/<Route>`) | `src/routing/app-routing-setup.tsx`; path constants ở `src/constants/routes.ts`                           |
| Server state        | **TanStack React Query 5**                          | `QueryClientProvider` đã wire trong `src/providers/app-providers.tsx`; client ở `src/lib/query-client.ts` |
| Global client state | **Zustand** (+ `persist`)                           | `src/stores/*.store.ts` (auth, ui). Không để server data ở đây                                            |
| HTTP client         | **Axios**                                           | `src/lib/axios.ts` — instance + interceptor token/error                                                   |
| Form                | **react-hook-form + zod**                           | resolver `@hookform/resolvers/zod`                                                                        |
| i18n                | **react-intl**                                      | `src/i18n/`, default `vi`; wire trong providers                                                           |
| Data mode           | **mock-first**                                      | `VITE_USE_MOCK=1` → feature API trả mock (`src/mocks/`); tắt để gọi REST thật                             |
| Test                | **Vitest + Testing Library** (jsdom)                | `src/test/setup.ts`, file `*.test.ts(x)` cạnh source                                                      |
| Chất lượng          | **ESLint + Prettier + Husky + lint-staged**         | pre-commit chạy `lint-staged`                                                                             |

Phiên bản chính xác lấy từ `package.json` — đừng hardcode version vào doc.

---

## 2. App Foundation (đã scaffold)

```
src/
├── App.tsx                      # <AppProviders><AppRouting/></AppProviders>
├── providers/
│   └── app-providers.tsx        # Gom mọi provider: Error→Theme→i18n→Helmet→Query→LoadingBar→Router→Toaster
├── config/
│   └── env.ts                   # Đọc import.meta.env đã type hóa (env.apiUrl, env.useMock, ...)
├── lib/
│   ├── axios.ts                 # api instance + configureApiAuth() nối với auth store
│   ├── query-client.ts          # QueryClient mặc định
│   └── utils.ts                 # cn() (đã có sẵn)
├── constants/
│   ├── routes.ts                # ROUTES + buildPath()
│   └── query-keys.ts            # createQueryKeys(scope) factory
├── stores/
│   ├── auth.store.ts            # user, token, hasPermission() — persist
│   └── ui.store.ts              # sidebarCollapsed — persist
├── i18n/
│   ├── config.ts                # LOCALES, messagesByLocale, DEFAULT_LOCALE
│   ├── i18n-provider.tsx        # <IntlProvider>
│   └── messages/{vi,en}.ts      # catalog theo key `feature.key`
├── types/
│   └── api.types.ts             # ApiResponse, PaginatedResponse, ApiError, ...
├── mocks/
│   ├── mock-response.ts         # mockResponse(data, delayMs)
│   └── README.md                # quy ước mock-first
├── components/
│   ├── ui/                      # base components (KHÔNG tạo base mới ngoài đây)
│   ├── common/                  # ErrorBoundary, screen-loader, ...
│   └── layouts/                 # main-layout (template) + layout-1..39 (demo Metronic)
├── pages/
│   ├── main-layout/             # trang quản lý nhân viên (template surface, route /)
│   └── layout-*/                # trang demo Metronic
└── test/
    └── setup.ts                 # setup Vitest + Testing Library
```

`src/examples/` chứa feature mẫu (dev-only, loại khỏi production build) — xem
`src/examples/README.md`. `features/` chưa tồn tại — tạo khi bắt đầu domain thật (xem §4).
`examples/<domain>` là **khuôn copy-được** cho `features/<domain>`: cùng cấu trúc feature-first.
Bắt đầu feature mới bằng cách copy `src/examples/employees/`.

---

## 3. Data Flow (một chiều, rõ ràng)

```
Component (page)
  └─ hook feature (useEmployeeList)        ← state lọc/phân trang, gọi query
       └─ React Query (useQuery/useMutation)
            └─ feature API (employee.api.ts)
                 ├─ env.useMock = true  → mockResponse(mockData)      (src/mocks)
                 └─ env.useMock = false → api.get/post (axios)         (src/lib/axios)
                       └─ interceptor: gắn token (auth.store), normalize ApiError, 401 → logout
```

Quy tắc:

- **Component không gọi API trực tiếp** — luôn qua hook → React Query.
- **Server state ở React Query**, không nhét vào Zustand.
- **Global client state (auth, UI) ở Zustand**; chỉ những gì thực sự cross-feature.
- Lỗi để React Query xử lý: `onError` mutation → toast; `error` query → `ErrorState`.

---

## 4. Thêm một Feature (end-to-end)

Đặt trong `src/features/<domain>/` (feature-first). Thứ tự dựng:

1. `types/<domain>.types.ts` — interface entity, DTO.
2. `schemas/<domain>.schema.ts` — zod schema (validate tiếng Việt).
3. `api/<domain>.api.ts` — hàm gọi API, **rẽ nhánh `env.useMock`** (xem `src/mocks/README.md`).
4. `api/<domain>.queries.ts` — `useQuery`/`useMutation`, dùng key từ `createQueryKeys('<domain>')`.
5. `hooks/use<Domain>List.ts` — gộp filter + pagination + query.
6. `components/*` — UI riêng feature, **lắp từ `@/components/ui`** (xem `docs/06`).
7. `pages/<Domain>Page.tsx` — **named export**, chỉ layout/render.
8. Đăng ký path ở `src/constants/routes.ts` + route ở `src/routing/app-routing-setup.tsx`.

Mọi page phải có đủ state: loading skeleton, empty, error+retry, permission-aware action (xem `docs/05`).

---

## 5. Lệnh

```bash
npm run dev        # dev server (http://localhost:5173)
npm run build      # tsc + vite build — cổng xác thực bắt buộc (exit 0)
npm run test       # vitest watch
npm run test:run   # vitest chạy 1 lần (dùng cho CI/verify)
npm run lint       # eslint --fix
npm run format     # prettier --write .
```

Pre-commit (husky) tự chạy `lint-staged` trên file staged: `eslint --fix` + `prettier --write`.

---

## 6. Env

Khai báo type ở `src/vite-env.d.ts`, đọc qua `src/config/env.ts`. Mẫu: `.env.example` → copy thành
`.env.local` (không commit).

| Biến                  | Ý nghĩa                         |
| --------------------- | ------------------------------- |
| `VITE_API_URL`        | Base URL REST API               |
| `VITE_USE_MOCK`       | `1` dùng mock, `0` gọi API thật |
| `VITE_APP_NAME`       | Tên app                         |
| `VITE_DEFAULT_LOCALE` | `vi` \| `en`                    |

---

## 7. Quan hệ với các doc khác

- `docs/01` — convention chi tiết (naming/TS/React/Tailwind/RHF). **Phần stack/version trong §16 đã cũ → theo file này.**
- `docs/02` — UX direction (admin Việt, dense, table-first).
- `docs/03` — permission/RBAC (frontend chỉ UX, backend vẫn bắt buộc check).
- `docs/04` — case study ngoài, chỉ tham chiếu, không copy brand/domain.
- `docs/05` — danh mục example pages cần dựng.
- `docs/06` — **cách dùng component project thay HTML thô** (DataGrid pattern...).
- `CLAUDE.md` — vai trò giám sát + quy tắc review.
