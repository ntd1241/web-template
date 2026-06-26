# Bảng kiểm định + lọc theo nhóm + mock Palăng — Design

Ngày: 2026-06-26
Phạm vi: `src/examples/material/**`, menu + routes. Mock-first, example-only.

## Mục tiêu

1. Trang **Bảng kiểm định** (inspection checklist) — master-detail, CRUD bảng và từng tiêu chí.
2. Form **Mẫu vật tư**: checkbox "Quản lý an toàn" → chọn 1 bảng kiểm định → preview checklist.
3. Trang **Mẫu vật tư**: thêm cây nhóm bên trái, click nhóm → lọc bảng mẫu.
4. Trang **Tạo/Sửa vật tư**: thêm select **Nhóm** (lọc) trước select **Mẫu**.
5. Mock từ `Palang.xlsx`: nhóm Vật tư kiểm định › Palăng, mẫu Palăng xích tay (an toàn → bảng kiểm định), 5 thiết bị thật, đưa lên đầu.

Quyết định đã chốt: 5 thiết bị palăng; thông số palăng là spec-definition tái dùng; mỗi mẫu gắn **một** bảng kiểm định.

## Domain mới

### `model/inspection-table.ts`
```ts
export interface InspectionCriterion {
  id: string;
  order: number;       // STT
  content: string;     // nội dung tiêu chí
}
export interface InspectionTable {
  id: string;
  code: string;
  name: string;
  description?: string;
  criteria: InspectionCriterion[];
}
```

### `MaterialModel` (sửa `model/material-model.ts`)
Thêm 2 field optional (không phá mock cũ):
```ts
isSafetyManaged?: boolean;       // "Quản lý an toàn"
inspectionTableId?: string;      // FK -> InspectionTable, chỉ khi isSafetyManaged
```

### `data/inspection-tables.mock.ts`
- 1 bảng từ sheet 2: `insp-palang` "Tiêu chuẩn kiểm định palăng" với 9 tiêu chí (copy nguyên văn nội dung).
- 1 bảng phụ mẫu (vd thang/giàn giáo) để list có ≥2 dòng, demo CRUD.

## Mock Palăng (đưa lên đầu mảng)

### Nhóm (`data/material-groups.mock.ts`) — chèn đầu
```
grp-kiem-dinh  "Vật tư kiểm định"   parentId: null
grp-palang     "Palăng"             parentId: grp-kiem-dinh
```
(Khác `grp-kiem-ke` "Thiết bị kiểm kê" sẵn có — kiểm định ≠ kiểm kê.)

### Spec-definitions mới (`data/spec-definitions.mock.ts`)
Tất cả `allowModelSelectionOverride: false`, `allowModelValueSetOverride: false`:
- `spec-palang-taitrong-tk`  "Tải trọng thiết kế"  number, unit `Tấn`
- `spec-palang-chieucao`     "Chiều cao nâng"      number, unit `Mét`
- `spec-palang-taitrong-max` "Tải trọng lớn nhất"  number, unit `Tấn`
- `spec-palang-nsx`          "Nhà sản xuất"        text
- `spec-palang-mahieu`       "Mã hiệu"             text

### Mẫu (`data/material-models.mock.ts`) — chèn đầu
`model-palang-xich-tay` "Palăng xích tay", groupId `grp-palang`,
`isSafetyManaged: true`, `inspectionTableId: 'insp-palang'`. Specs:
- tải trọng thiết kế (locked theo từng thiết bị → để `editable`, vì mỗi thiết bị khác tải), chiều cao nâng (editable), tải trọng lớn nhất (editable), nhà SX (editable), mã hiệu (editable).
  → dùng `materialValueMode: 'editable'` để 5 thiết bị nhập giá trị riêng.

### Thiết bị thật (`data/materials.mock.ts`) — chèn đầu
5 dòng đại diện đủ 3 mức tải (≤3T, 3–7.5T, >7.5T), modelId `model-palang-xich-tay`,
`group: 'kiem-ke'` (legacy enum gần nhất — chỉ dùng cho badge cũ), code = Mã số quản lý từ sheet,
specValues nhập tải trọng/chiều cao/NSX/mã hiệu theo từng dòng. Ví dụ:
`PLX.1.3.001` (1T×3M NITTO), `PLX.2.3.001` (2T×3M), `PLX.3.5.001` (3T×5M),
`PLX.5.4.001` (5T×4M), `PLX.10.5.001` (10T×5M).

## UI / Trang

### A. Trang Bảng kiểm định — `inspection/pages/inspection-tables-page.tsx`
Layout giống `material-groups-page.tsx`: Card trái (list bảng + nút "Thêm bảng"), Card phải (chi tiết).
- Trái: list bảng kiểm định (component `inspection-table-list.tsx`), click → chọn; mỗi dòng badge số tiêu chí.
- Phải khi chọn bảng:
  - Form sửa thông tin bảng (mã, tên, mô tả) — dùng form-builder fixture `inspection-table.form.fixture.ts`.
  - Bảng tiêu chí (checklist rows): STT | Nội dung | thao tác (sửa/xóa). Nút "Thêm tiêu chí".
  - Thêm/sửa tiêu chí qua dialog nhỏ (textarea nội dung) — `criterion-form-dialog.tsx`.
- Xóa bảng: chặn nếu đang được mẫu vật tư tham chiếu (toast lỗi), ngược lại `ConfirmDeleteDialog`.
- State cục bộ trong store (xem dưới).

Route: `ROUTES.EXAMPLE.MATERIAL_INSPECTIONS = '/example/materials/inspections'`.
Menu: thêm item "Bảng kiểm định" (icon `ClipboardCheck`) trong nhóm Quản trị, cạnh các item vật tư.

### B. Form Mẫu vật tư (`material-model-form.generated.tsx` + fixture)
Thêm field qua form-builder fixture `material-model.form.fixture.ts`:
- `isSafetyManaged` checkbox "Quản lý an toàn" (col-span-12).
- `inspectionTableId` select "Bảng kiểm định" — chỉ render khi `isSafetyManaged` bật (watch).
Dưới select, preview checklist (đọc `inspectionTableId` → render danh sách tiêu chí read-only). Preview nằm trong form component, nhận `inspectionTables` qua prop.
Schema `material-model.schema.ts`: thêm `isSafetyManaged: z.boolean()`, `inspectionTableId: z.string().optional()`, refine: bật mà chưa chọn bảng → lỗi "Chọn bảng kiểm định".
Editor page truyền `inspectionTables` từ store xuống wizard → form. Submit map 2 field mới vào `MaterialModel`.

### C. Trang Mẫu vật tư — thêm cây nhóm
Sửa `material-models-page.tsx` thành layout 2 cột giống groups page:
- Trái: `MaterialGroupTree` (tái dùng component sẵn có) + nút "Tất cả" để bỏ lọc. `modelCountByGroup` đếm theo model.
- Phải: bảng mẫu hiện tại, lọc theo `selectedGroupId` (gồm nhóm con — dùng `getSelfAndDescendantIds`) + ô tìm keyword.
- Không chọn nhóm = hiện tất cả.

### D. Trang Tạo/Sửa vật tư — chọn nhóm trước mẫu
Sửa `material-editor-page.tsx` + `material-form.generated.tsx` fixture:
- Thêm field `groupId` (select Nhóm) **trước** `modelId` (select Mẫu). `groupId` không lưu vào `Material` (chỉ hỗ trợ lọc UI) — giữ trong form values, bỏ qua khi submit.
- `modelIdOptions` lọc theo `groupId` đã chọn (gồm nhóm con). Chưa chọn nhóm = tất cả mẫu.
- Đổi nhóm → clear `modelId` + `specValues`.
- Khi sửa thiết bị có sẵn: set `groupId` = nhóm của mẫu hiện tại lúc reset.

## Store
Mở rộng `material-catalog.store.ts` (giữ pattern singleton + listeners) thêm `inspectionTables` và `upsertInspectionTable` / `removeInspectionTable`. Tiêu chí sửa qua upsert cả bảng (criteria nằm trong bảng). Khởi tạo từ `INSPECTION_TABLES_MOCK`.

## Builder / Convention
- Form mới (bảng kiểm định, field mẫu vật tư) đi qua form-builder: tạo/sửa `*.form.fixture.ts` rồi `npm run gen:form` ra file `*.generated.tsx`, sau đó wire submit/reset ở parent (đúng `docs/workflows/implement-ui.md`).
- Bảng checklist tiêu chí: bảng nhỏ tĩnh, không cần table-builder DataGrid đầy đủ — render list/table đơn giản bằng `src/components/ui` (giống panel nhóm). Nếu review yêu cầu, nâng lên table-builder.
- Named exports, `handle*`, `is/has` booleans, `import type`, alias `@/`, copy tiếng Việt, đủ state empty/confirm.

## Test / Verify
- Unit: helper lọc model theo nhóm (self+descendant) nếu tách ra; map form ↔ model cho field mới.
- `npm run build` + targeted tests. Browser check cho trang Bảng kiểm định + layout 2 cột Mẫu vật tư (1366/1920) vì là layout/overlay mới.

## Ngoài phạm vi
- Không đổi trang public-detail.
- Không refactor hệ enum legacy `MaterialGroupKey`.
- Không thêm phân quyền backend (mock).
```
