# Admin Web Template (Vietnamese market)

Template admin/web tái sử dụng, build trên **Metronic 9 + ReUI**, hướng tới thị trường Việt Nam:
dense, table-first, desktop 1366–1920px. Mục tiêu: copy một example page gần đúng, đổi domain data,
triển khai dự án thật nhanh nhất.

## Stack

Vite 7 · React 19 · TypeScript (strict) · Tailwind CSS 4 (`@theme`) · React Router 7 ·
TanStack React Query 5 · Zustand · Axios · react-hook-form + zod · react-intl · Vitest + Testing Library.

Chi tiết & kiến trúc: **[`docs/00-stack-and-architecture.md`](docs/00-stack-and-architecture.md)**.

## Bắt đầu

```bash
npm install --force        # --force do React 19 peer ranges
cp .env.example .env.local # cấu hình env (mặc định mock-first, chạy được ngay)
npm run dev                # http://localhost:5173  (/ = trang quản lý nhân viên mẫu)
```

Template chạy **mock-first**: `VITE_USE_MOCK=1` nên không cần backend. Khi có API thật, đặt
`VITE_USE_MOCK=0` và `VITE_API_URL`. Auth được trừu tượng hóa (`src/stores/auth.store.ts` +
`src/lib/axios.ts`) — backend-agnostic, không gắn cứng với nhà cung cấp nào.

## Lệnh

```bash
npm run build      # tsc + vite build (cổng xác thực, exit 0)
npm run test:run   # vitest chạy 1 lần
npm run lint       # eslint --fix
npm run format     # prettier --write .
```

Pre-commit (husky) chạy `lint-staged` trên file staged.

## Tài liệu

| File | Nội dung |
|---|---|
| [`docs/00`](docs/00-stack-and-architecture.md) | Stack, foundation, data flow, cách thêm feature — **đọc đầu tiên** |
| [`docs/01`](docs/01-coding-convention.md) | Convention: naming, TS, React, Tailwind, form, routing |
| [`docs/02`](docs/02-design-system.md) | UX direction (admin Việt, dense, table-first) |
| [`docs/03`](docs/03-permission-system-design.md) | Permission / RBAC |
| [`docs/04`](docs/04-specific-design-system.md) | Case study tham chiếu (không copy brand) |
| [`docs/05`](docs/05-example-pages-proposal.md) | Danh mục example pages cần dựng |
| [`docs/06`](docs/06-component-usage-guide.md) | Dùng component project thay HTML thô (DataGrid…) |
| [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md) | Hướng dẫn cho coding agent & quy tắc review |

## Cấu trúc nhanh

```
src/
├── providers/      # AppProviders (gom mọi provider)
├── config/env.ts   # env type hóa
├── lib/            # axios, query-client, utils(cn)
├── stores/         # Zustand (auth, ui)
├── constants/      # routes, query-keys
├── i18n/           # react-intl (vi mặc định)
├── mocks/          # mock-first data layer
├── components/ui/  # base components (ReUI/Metronic)
├── components/layouts/main-layout   # shell template (route /)
└── pages/          # main-layout (template) + layout-1..39 (demo Metronic)
```

> Nguồn gốc: Metronic 9 by KeenThemes — xem [ReUI](https://v1.reui.io) cho component library.
