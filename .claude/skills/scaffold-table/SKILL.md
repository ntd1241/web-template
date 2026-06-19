---
name: scaffold-table
description: 'Dựng một bảng dữ liệu (DataGrid) bằng table-builder thay vì viết tay ColumnDef — sinh khung cột từ spec rồi điền cell. Dùng khi user nói "tạo bảng / dựng bảng / scaffold table / gen table / làm trang danh sách / data grid / bảng quản lý X" hoặc khi cần một grid mới có phân trang. Bắt buộc theo mô hình scaffold-and-own: gen 1 lần rồi SỞ HỮU file, không regen đè. KHÔNG dùng để viết tay ColumnDef, KHÔNG phải pha bố cục (đó là block-layout), KHÔNG phải soát UI (đó là design-review).'
---

# Scaffold Table (dựng grid bằng table-builder)

## Tại sao tồn tại

Repo có sẵn `data-grid-columns` column-factory + `DataGrid`. Viết tay `ColumnDef[]` mỗi trang gây
drift (cấu trúc cột, header, meta, size mỗi nơi một kiểu). **table-builder** sinh khung cột nhất quán
từ một spec nhỏ; agent chỉ điền cell tùy biến. Tham chiếu đầy đủ: [`docs/08-scaffold-builders.md`](../../../docs/08-scaffold-builders.md).

## Mô hình bắt buộc: scaffold-and-own

- Gen **một lần** → file thuộc về bạn, sửa tự do. Builder **không bao giờ** regen đè / merge ngược.
- Cần đổi cột/thứ tự/size → **sửa spec**, regen ra **scratch path**, rồi tự reconcile. Không regen đè file đã sửa.
- Builder **không emit HTML thô** — mọi cell compose từ `src/components/ui`.

## Quy trình (theo thứ tự)

1. **Model** — đảm bảo type dòng tồn tại (`model/<entity>.ts`). Field enum-ish (status, nhóm) → cột `badge`.
2. **Spec** — `<domain>/table/<entity>.table.fixture.ts`, `export default` một `TableSpec`
   (`import type { TableSpec } from '@/builders/table'`), đặt `specPath` cho banner.
   - Tên file phải là `.fixture.ts` (KHÔNG `.spec.ts` — vitest sẽ nhặt làm test).
3. **Gen**
   ```bash
   npm run gen:table -- <spec.ts> <out.tsx>
   ```
4. **Điền stub** — mở file sinh ra (đã sở hữu). Thay từng `cell: () => null` của cột
   `qr`/`identity`/`actions`/`custom` bằng JSX thật. Cột accessor + `badge` đã xong sẵn.
5. **Set `size`** — `DataGridTable` là `table-fixed` chia đều phần dư → grid nhiều cột bị bóp/cắt nếu
   không có `size` (px) mỗi cột. Đặt `size` trong **cả spec lẫn file sinh** để regen sau giữ được.
6. **Wire** — `useReactTable({ data, columns: use<Entity>Columns(), getCoreRowModel, ... })` trong
   `DataGrid` (mẫu: `src/examples/material/pages/materials-management-page.tsx`).
7. **Verify** — `npm run test:run` xanh; browser-check 1366 & 1920 (không cắt chữ, không console error).

## Kind cột (tra nhanh)

`index` · `select` · `text`(tooltipOnTruncate?) · `number` · `currency` · `percent`(fractionDigits?) ·
`date`(mode date/datetime/relative) · `badge`(config value→{label,variant?,className?,dotClassName?},
sinh full) · `actions`/`custom` (**stub** `() => null`, điền inline). Opt chung: `headerClassName`,
`cellClassName`, `size`, `visibility`, `enableSorting`. Chi tiết: `docs/08` Part 1.

## Không làm

- Không viết tay `ColumnDef[]` cho grid mới — dùng builder.
- Không regen đè file đã điền stub (mất logic). Regen → scratch + reconcile.
- Không vá size/look per-page nếu thuộc về default — sửa ở `src/components/ui`/token (xem `docs/06 §0.1`).
- Không tạo builder mới ở đây — đó là `docs/08` Part 2.
