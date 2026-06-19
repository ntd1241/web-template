---
name: use-builder
description: 'Cổng chặn: trước khi tự viết tay một bề mặt feature (bảng/grid, form/dialog, trang danh sách, cột, component lặp lại), DỪNG và kiểm tra builder registry — nếu có builder phù hợp thì SCAFFOLD bằng nó (scaffold-and-own) thay vì tự code. Dùng khi user nói "tạo bảng / dựng grid / tạo form / làm trang danh sách / quản lý X / data table / thêm cột" hoặc khi sắp viết ColumnDef/form fields bằng tay. Một skill chung cho MỌI builder — không tạo skill riêng cho từng builder. KHÔNG phải pha bố cục (block-layout), KHÔNG phải soát UI (design-review).'
---

# Use Builder (ưu tiên builder, đừng tự code component)

## Tại sao tồn tại

Repo có hệ **scaffold builder** (codegen từ spec) cho các bề mặt lặp lại. Tự viết tay
`ColumnDef[]`/form fields mỗi trang gây **drift** (cấu trúc, header, meta, size mỗi nơi một kiểu).
Skill này là **cổng**: nhắc agent dùng builder + chỉ tới **registry** để chọn đúng cái — không cần
một skill riêng cho từng builder.

## Quy trình (1 phút)

1. **Đọc registry** đầu file [`src/builders/README.md`](../../../src/builders/README.md) — bảng liệt
   kê builder hiện có: *scaffolds gì · spec type · command · dùng khi nào*.
2. **Khớp?** Nếu bề mặt sắp làm trùng một dòng registry (vd "bảng" → builder `table`):
   - Làm theo quy trình của builder đó trong [`docs/08-scaffold-builders.md`](../../../docs/08-scaffold-builders.md) Part 1
     (viết spec → chạy `npm run gen:*` → điền cell/field stub → set `size` nếu cần → wire → verify).
   - **Scaffold-and-own**: gen 1 lần rồi SỞ HỮU file; **không** regen đè file đã sửa (đổi cột/size →
     sửa spec, regen ra **scratch path**, reconcile tay).
3. **Không khớp?** Tự dựng theo `docs/06` (compose `src/components/ui`, không HTML thô). Nếu bề mặt
   này lặp lại nhiều nơi → cân nhắc **tạo builder mới** theo `docs/08` Part 2 (rồi thêm dòng registry).

## Không làm

- Không viết tay những gì builder lo được (vd `ColumnDef[]` cho grid mới) — kiểm registry trước.
- Không regen đè file đã điền logic (mất công sửa). Regen → scratch + reconcile.
- Không tạo skill riêng cho từng builder — registry + `docs/08` là đủ.
- Không vá per-page cái thuộc về default component/token (xem `docs/06 §0.1`).
