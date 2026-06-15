# Examples (reference features)

Thư mục này chứa các **feature mẫu** để coding agent/dev học và **copy** khi dựng feature thật.
Mỗi example là một module **feature-first** giống hệt một `src/features/<domain>` thật (xem
`docs/00` §4 và `docs/01` §11) — đây chính là giá trị của nó: copy sang là đúng cấu trúc ngay.

## Quy ước

- Chỉ hiển thị ở **dev**: routes được gate sau `import.meta.env.DEV` trong
  `src/routing/app-routing-setup.tsx`, nên `npm run build` (production) không kèm.
- Đăng ký route tập trung ở `src/examples/example-routes.tsx` (lazy-load).
- Mỗi example tự chứa: `model/`, `data/`, `schemas/`, `api/`, `hooks/`, `components/`, `pages/`,
  `index.ts`. Lắp UI từ `@/components/ui` (không tạo base mới — xem `docs/06`).

## Copy sang feature thật

1. Copy `src/examples/<domain>/` → `src/features/<domain>/`.
2. Trong `api/<domain>.api.ts`, bỏ nhánh mock, giữ nhánh gọi `api` (axios) — hoặc đặt
   `VITE_USE_MOCK=0`.
3. Đăng ký route thật trong `src/routing/app-routing-setup.tsx` (ngoài block DEV).
4. Cập nhật `src/constants/routes.ts` nếu cần path mới.

## Gỡ toàn bộ example

Xóa thư mục `src/examples/` và dòng `{import.meta.env.DEV && exampleRoutes}` (cùng import của nó)
trong `src/routing/app-routing-setup.tsx`. Không còn dấu vết trong dự án thật.

## Danh sách

| Example | Đường dẫn (dev) | Pattern minh họa |
|---|---|---|
| `employees` | `/example/employees` | Data table chuẩn: DataGrid + React Query (mock-first) + search debounce + phân trang server + action gated theo quyền + loading/empty/error states |

Các example tiếp theo nên bám `docs/05-example-pages-proposal.md`.
