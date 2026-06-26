# Bảng kiểm định + lọc nhóm + mock Palăng — Implementation Plan

> **For agentic workers:** Triển khai tuần tự từng Task. Mỗi Task kết thúc bằng một deliverable test/build được. Dùng checkbox `- [ ]` để theo dõi.

**Goal:** Thêm trang Bảng kiểm định (checklist CRUD), gắn checklist an toàn vào mẫu vật tư, đưa cây nhóm + lọc vào trang Mẫu vật tư, thêm chọn Nhóm→Mẫu ở trang tạo vật tư, và nạp mock Palăng từ `Palang.xlsx`.

**Architecture:** Mock-first, example-only, toàn bộ trong `src/examples/material/**`. State runtime qua singleton store `material-catalog.store.ts` (pattern listeners sẵn có). Form mới qua form-builder (`npm run gen:form`) rồi sở hữu file generated. UI tái dùng `src/components/ui` + component sẵn có (`MaterialGroupTree`, `ConfirmDeleteDialog`, `DataGrid`).

**Tech Stack:** React 19, TS, React Router 7, RHF + zod, Tailwind 4, vitest. Alias `@/` → `src/`.

## Global Constraints

- Tiếng Việt cho mọi label/placeholder/validation/empty/confirm.
- Named exports cho component/page mới; handler `handle*`; boolean `is/has/can`; `import type`; `@/` cho cross-folder.
- Không thêm `any`. Không sửa trang public-detail. Không refactor enum legacy `MaterialGroupKey`.
- Field/trang sinh được bằng builder phải đi qua builder: sửa `*.form.fixture.ts` rồi `npm run gen:form -- <fixture> <out>`, sau đó wire ở parent. Không sửa banner generated.
- Mock Palăng chèn **đầu** mảng (đưa lên đầu danh sách).
- Spec nguồn: `docs/superpowers/specs/2026-06-26-inspection-checklists-and-palang-mock-design.md` — đọc kèm khi cần chi tiết.
- Verify mỗi mốc: `npm run build`. Test: `npm run test:run`.

---

## File Structure

**Tạo mới:**
- `src/examples/material/model/inspection-table.ts` — type `InspectionTable`, `InspectionCriterion`.
- `src/examples/material/data/inspection-tables.mock.ts` — `INSPECTION_TABLES_MOCK`.
- `src/examples/material/inspection/inspection-table.schema.ts` — zod cho form bảng.
- `src/examples/material/inspection/form/inspection-table.form.fixture.ts` — FormSpec.
- `src/examples/material/inspection/components/inspection-table-form.generated.tsx` — gen.
- `src/examples/material/inspection/components/inspection-table-list.tsx` — list trái.
- `src/examples/material/inspection/components/criterion-form-dialog.tsx` — dialog thêm/sửa tiêu chí.
- `src/examples/material/inspection/components/inspection-criteria-table.tsx` — bảng tiêu chí.
- `src/examples/material/inspection/pages/inspection-tables-page.tsx` — trang.
- `src/examples/material/lib/filter-models-by-group.ts` (+ `.test.ts`) — helper lọc model theo nhóm (self+descendant).

**Sửa:**
- `src/examples/material/model/material-model.ts` — thêm `isSafetyManaged`, `inspectionTableId`.
- `src/examples/material/models/material-model.schema.ts` — 2 field + refine.
- `src/examples/material/models/form/material-model.form.fixture.ts` — thêm switch + select; re-gen.
- `src/examples/material/models/components/material-model-form.generated.tsx` — sau gen: conditional + preview checklist (owned).
- `src/examples/material/models/components/material-model-wizard.tsx` + `models/pages/material-model-editor-page.tsx` — truyền `inspectionTables`, map field mới.
- `src/examples/material/models/pages/material-models-page.tsx` — layout 2 cột + cây nhóm + lọc.
- `src/examples/material/pages/material-editor-page.tsx` — select Nhóm trước Mẫu, lọc model.
- `src/examples/material/form/material.form.fixture.ts` + `components/material-form.generated.tsx` — field `groupId` (UI-only) trước `modelId`; re-gen + wire.
- `src/examples/material/material.schema.ts` — thêm `groupId` optional (không lưu).
- `src/examples/material/stores/material-catalog.store.ts` — inspectionTables + upsert/remove.
- `src/examples/material/data/material-groups.mock.ts` — chèn `grp-kiem-dinh`, `grp-palang`.
- `src/examples/material/data/spec-value-sets.mock.ts` — `vs-palang-muctai`.
- `src/examples/material/data/spec-definitions.mock.ts` — 6 spec palăng.
- `src/examples/material/data/material-models.mock.ts` — mẫu `model-palang-xich-tay` (đầu mảng).
- `src/examples/material/data/materials.mock.ts` — 5 thiết bị palăng (đầu mảng).
- `src/constants/routes.ts` — `MATERIAL_INSPECTIONS`.
- `src/examples/example-routes.tsx` — route trang mới.
- `src/config/menu.config.tsx` — item "Bảng kiểm định".

---

## Task 1: Domain + mock dữ liệu kiểm định & Palăng

**Files:**
- Create: `src/examples/material/model/inspection-table.ts`, `src/examples/material/data/inspection-tables.mock.ts`
- Modify: `model/material-model.ts`, `data/material-groups.mock.ts`, `data/spec-value-sets.mock.ts`, `data/spec-definitions.mock.ts`, `data/material-models.mock.ts`, `data/materials.mock.ts`

**Interfaces produced:**
- `InspectionTable { id; code; name; description?; criteria: InspectionCriterion[] }`
- `InspectionCriterion { id; order: number; content: string }`
- `INSPECTION_TABLES_MOCK: InspectionTable[]`
- `MaterialModel.isSafetyManaged?: boolean`, `MaterialModel.inspectionTableId?: string`

- [ ] **Step 1: Tạo type** `model/inspection-table.ts`:

```ts
/** Bảng kiểm định — mỗi bảng là một checklist tiêu chí. Mock-first, example-only. */
export interface InspectionCriterion {
  id: string;
  order: number;
  content: string;
}

export interface InspectionTable {
  id: string;
  code: string;
  name: string;
  description?: string;
  criteria: InspectionCriterion[];
}
```

- [ ] **Step 2: Thêm 2 field vào `MaterialModel`** (`model/material-model.ts`, trong interface, sau `specs`):

```ts
  /** "Quản lý an toàn" — bật thì gắn bảng kiểm định. */
  isSafetyManaged?: boolean;
  /** FK -> InspectionTable, chỉ khi isSafetyManaged. */
  inspectionTableId?: string;
```

- [ ] **Step 3: Mock bảng kiểm định** `data/inspection-tables.mock.ts`. Bảng `insp-palang` 9 tiêu chí (copy nguyên văn từ sheet 2 của `Palang.xlsx`), + 1 bảng `insp-thang` (Thang/giàn giáo) ≥3 tiêu chí để list có nhiều dòng:

```ts
import type { InspectionTable } from '../model/inspection-table';

export const INSPECTION_TABLES_MOCK: InspectionTable[] = [
  {
    id: 'insp-palang',
    code: 'KD-PALANG',
    name: 'Tiêu chuẩn kiểm định palăng',
    description: 'Checklist kiểm định an toàn palăng xích/cáp.',
    criteria: [
      { id: 'pl-1', order: 1, content: 'Kết cấu khung dầm chịu lực không bị nứt, biến dạng, rỉ sét.' },
      { id: 'pl-2', order: 2, content: 'Bu lông, liên kết mối hàn chắc chắn, không bị lỏng/nứt.' },
      { id: 'pl-3', order: 3, content: 'Móc cẩu: Không nứt, độ mòn lòng móc không quá 10%.' },
      { id: 'pl-4', order: 4, content: 'Chốt chặn an toàn (safety latch) tại miệng móc hoạt động tốt.' },
      { id: 'pl-5', order: 5, content: 'Móc cẩu tự xoay trơn tru quanh trục, không bị kẹt.' },
      { id: 'pl-6', order: 6, content: 'Đối với palang cáp: Cáp không bị nổ, đứt sợi quá giới hạn, không bị dập hay xoắn thắt nút.' },
      { id: 'pl-7', order: 7, content: 'Đối với palang xích: Xích không bị mòn mắt, không rạn nứt hay giãn dài quá mức cho phép.' },
      { id: 'pl-8', order: 8, content: 'Tang cuốn cáp và puly dẫn hướng không bị mòn rãnh hoặc sứt mẻ.' },
      { id: 'pl-9', order: 9, content: 'Bộ phận xếp cáp (nếu có) hoạt động trơn tru, không kẹt cáp.' },
    ],
  },
  {
    id: 'insp-thang',
    code: 'KD-THANG',
    name: 'Tiêu chuẩn kiểm định thang nhôm',
    description: 'Checklist kiểm định an toàn thang/giàn giáo di động.',
    criteria: [
      { id: 'th-1', order: 1, content: 'Bậc thang không nứt, cong vênh, không lỏng mối ghép.' },
      { id: 'th-2', order: 2, content: 'Chân thang có đệm chống trượt, không mòn quá mức.' },
      { id: 'th-3', order: 3, content: 'Khớp khóa, bản lề hoạt động chắc chắn, không rơ lỏng.' },
    ],
  },
];
```

- [ ] **Step 4: Nhóm** — `data/material-groups.mock.ts`, chèn **đầu** mảng:

```ts
  {
    id: 'grp-kiem-dinh',
    code: 'NHOM-KD',
    name: 'Vật tư kiểm định',
    parentId: null,
    description: 'Thiết bị nâng hạ phải kiểm định an toàn.',
    sortOrder: 0,
  },
  {
    id: 'grp-palang',
    code: 'NHOM-PALANG',
    name: 'Palăng',
    parentId: 'grp-kiem-dinh',
    sortOrder: 1,
  },
```

- [ ] **Step 5: Value set Mức tải** — `data/spec-value-sets.mock.ts`, thêm vào mảng:

```ts
  {
    id: 'vs-palang-muctai',
    code: 'VS-PALANG-MUCTAI',
    name: 'Mức tải palăng',
    kind: 'generic',
    isActive: true,
    options: [
      { id: 'muctai-le-3', label: 'Tải trọng ≤ 3,0 tấn', value: 'le-3' },
      { id: 'muctai-3-75', label: '3,0 tấn < Tải trọng ≤ 7,5 tấn', value: '3-75' },
      { id: 'muctai-tren-75', label: 'Tải trọng > 7,5 tấn', value: 'tren-75' },
    ],
  },
```

- [ ] **Step 6: Spec-definitions palăng** — `data/spec-definitions.mock.ts`, thêm vào mảng:

```ts
  {
    id: 'spec-palang-muctai',
    code: 'TS-MUCTAI',
    name: 'Mức tải',
    dataType: 'list',
    defaultValueSetId: 'vs-palang-muctai',
    defaultSelectionMode: 'single',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-palang-taitrong-tk',
    code: 'TS-TAITRONG-TK',
    name: 'Tải trọng thiết kế',
    dataType: 'number',
    unit: 'Tấn',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-palang-chieucao',
    code: 'TS-CHIEUCAO-NANG',
    name: 'Chiều cao nâng',
    dataType: 'number',
    unit: 'Mét',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-palang-taitrong-max',
    code: 'TS-TAITRONG-MAX',
    name: 'Tải trọng lớn nhất',
    dataType: 'number',
    unit: 'Tấn',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-palang-nsx',
    code: 'TS-NSX',
    name: 'Nhà sản xuất',
    dataType: 'text',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
  {
    id: 'spec-palang-mahieu',
    code: 'TS-MAHIEU',
    name: 'Mã hiệu',
    dataType: 'text',
    allowModelSelectionOverride: false,
    allowModelValueSetOverride: false,
  },
```

- [ ] **Step 7: Mẫu Palăng** — `data/material-models.mock.ts`, chèn **đầu** mảng `MATERIAL_MODELS_MOCK`. Tất cả spec `materialValueMode: 'editable'`, `isRequired` theo nghĩa:

```ts
  {
    id: 'model-palang-xich-tay',
    code: 'MAU-PALANG-XT',
    name: 'Palăng xích tay',
    description: 'Palăng xích kéo tay, kiểm định an toàn định kỳ.',
    origin: 'Nhật Bản',
    groupId: 'grp-palang',
    isSafetyManaged: true,
    inspectionTableId: 'insp-palang',
    imageUrls: [],
    specs: [
      { id: 'pl-muctai', source: 'catalog', specDefinitionId: 'spec-palang-muctai', materialValueMode: 'editable', isRequired: true, sortOrder: 1 },
      { id: 'pl-taitrong-tk', source: 'catalog', specDefinitionId: 'spec-palang-taitrong-tk', materialValueMode: 'editable', isRequired: true, sortOrder: 2 },
      { id: 'pl-chieucao', source: 'catalog', specDefinitionId: 'spec-palang-chieucao', materialValueMode: 'editable', isRequired: true, sortOrder: 3 },
      { id: 'pl-taitrong-max', source: 'catalog', specDefinitionId: 'spec-palang-taitrong-max', materialValueMode: 'editable', isRequired: false, sortOrder: 4 },
      { id: 'pl-nsx', source: 'catalog', specDefinitionId: 'spec-palang-nsx', materialValueMode: 'editable', isRequired: false, sortOrder: 5 },
      { id: 'pl-mahieu', source: 'catalog', specDefinitionId: 'spec-palang-mahieu', materialValueMode: 'editable', isRequired: false, sortOrder: 6 },
    ],
  },
```

- [ ] **Step 8: 5 thiết bị Palăng** — `data/materials.mock.ts`, chèn **đầu** mảng `MATERIALS_MOCK`. `modelId: 'model-palang-xich-tay'`, `group: 'kiem-ke'` (badge legacy), `imageUrl: ''`, `tags: ['palăng','kiểm định']`. `specValues[].materialModelSpecId` = id spec trên mẫu (`pl-muctai`...). Number value dạng `{ amount, unit }`; list value = optionId; text = string. 5 dòng đại diện (sheet 1):

```ts
  {
    id: 'mt-palang-1', name: 'Palăng xích tay NITTO 1T×3M', code: 'PLX.1.3.001.SCĐ-VT4',
    imageUrl: '', group: 'kiem-ke', modelId: 'model-palang-xich-tay',
    specValues: [
      { materialModelSpecId: 'pl-muctai', value: 'muctai-le-3' },
      { materialModelSpecId: 'pl-taitrong-tk', value: { amount: 1, unit: 'Tấn' } },
      { materialModelSpecId: 'pl-chieucao', value: { amount: 3, unit: 'Mét' } },
      { materialModelSpecId: 'pl-taitrong-max', value: { amount: 1, unit: 'Tấn' } },
      { materialModelSpecId: 'pl-nsx', value: 'NITTO' },
      { materialModelSpecId: 'pl-mahieu', value: 'NITTO 1T X 3M' },
    ],
    tags: ['palăng', 'kiểm định'],
  },
  // mt-palang-2: PLX.2.3.001.SCĐ-VT4, 2T×3M NITTO, muctai-le-3
  // mt-palang-3: PLX.3.5.001.SCĐ-VT4, 3T×5M NITTO, muctai-le-3
  // mt-palang-4: PLX.5.4.001.SCĐ-VT4, 5T×4M NITTO, muctai-3-75
  // mt-palang-5: PLX.10.5.001.SCĐ-VT4, 10T×5M NITTO, muctai-tren-75 (taitrong-max 10)
```
Viết đủ 5 object theo mẫu trên (comment chỉ là tóm tắt giá trị; điền đầy đủ specValues như dòng 1).

- [ ] **Step 9: Build kiểm tra type**

Run: `npm run build`
Expected: PASS (không lỗi type ở mock).

- [ ] **Step 10: Commit**

```bash
git add src/examples/material/model/inspection-table.ts src/examples/material/data src/examples/material/model/material-model.ts
git commit -m "feat(material): add inspection-table domain + palang mock data"
```

---

## Task 2: Store mở rộng inspectionTables

**Files:**
- Modify: `src/examples/material/stores/material-catalog.store.ts`

**Interfaces produced:** hook trả thêm `inspectionTables: InspectionTable[]`, `upsertInspectionTable(t)`, `removeInspectionTable(id)`.

- [ ] **Step 1:** thêm import + biến module + seq giống `materials`:

```ts
import { INSPECTION_TABLES_MOCK } from '../data/inspection-tables.mock';
import type { InspectionTable } from '../model/inspection-table';
// ...
let inspectionTables = [...INSPECTION_TABLES_MOCK];
let inspectionTableSeq = 0;
export function nextInspectionTableId() {
  inspectionTableSeq += 1;
  return `insp-new-${inspectionTableSeq}`;
}
```

- [ ] **Step 2:** trong object trả về của `useMaterialCatalogStore`, thêm:

```ts
    inspectionTables,
    upsertInspectionTable(table: InspectionTable) {
      inspectionTables = inspectionTables.some((t) => t.id === table.id)
        ? inspectionTables.map((t) => (t.id === table.id ? table : t))
        : [...inspectionTables, table];
      emitChange();
    },
    removeInspectionTable(id: string) {
      inspectionTables = inspectionTables.filter((t) => t.id !== id);
      emitChange();
    },
```

- [ ] **Step 3:** `npm run build` → PASS.
- [ ] **Step 4: Commit** `feat(material): expose inspection tables in catalog store`.

---

## Task 3: Trang Bảng kiểm định (CRUD bảng + tiêu chí)

**Files:**
- Create: `inspection/inspection-table.schema.ts`, `inspection/form/inspection-table.form.fixture.ts`, `inspection/components/inspection-table-form.generated.tsx` (gen), `inspection/components/inspection-table-list.tsx`, `inspection/components/criterion-form-dialog.tsx`, `inspection/components/inspection-criteria-table.tsx`, `inspection/pages/inspection-tables-page.tsx`
- Modify: `src/constants/routes.ts`, `src/examples/example-routes.tsx`, `src/config/menu.config.tsx`

**Interfaces consumed:** store từ Task 2; `InspectionTable`/`InspectionCriterion` từ Task 1.

- [ ] **Step 1: Schema** `inspection/inspection-table.schema.ts`:

```ts
import { z } from 'zod';

export const inspectionTableFormSchema = z.object({
  code: z.string().min(1, 'Bắt buộc'),
  name: z.string().min(1, 'Bắt buộc'),
  description: z.string(),
});

export type InspectionTableFormValues = z.infer<typeof inspectionTableFormSchema>;
```

- [ ] **Step 2: Fixture form** `inspection/form/inspection-table.form.fixture.ts` (FormSpec: text `code` required, text `name` required, textarea `description`). Theo mẫu `models/form/material-model.form.fixture.ts`. `entity: 'InspectionTable'`, `schemaImport: '../inspection-table.schema'`, `schemaName: 'inspectionTableFormSchema'`, `valuesType: 'InspectionTableFormValues'`.

- [ ] **Step 3: Gen form**

Run: `npm run gen:form -- src/examples/material/inspection/form/inspection-table.form.fixture.ts src/examples/material/inspection/components/inspection-table-form.generated.tsx`
Expected: file generated, build PASS.

- [ ] **Step 4: `inspection-table-list.tsx`** — list trái, mỗi dòng nút chọn (tên + badge số tiêu chí), highlight `selectedId`. Theo style item của `groups/components/material-group-tree.tsx` (dùng `cn`, `bg-admin-surface-alt`). Props: `tables`, `selectedId`, `onSelect`.

- [ ] **Step 5: `criterion-form-dialog.tsx`** — Dialog (`@/components/ui/dialog`) 1 `Textarea` "Nội dung tiêu chí" + nút Lưu/Hủy. Props: `open`, `onOpenChange`, `initialContent`, `onSubmit(content)`. Validate rỗng → disable Lưu.

- [ ] **Step 6: `inspection-criteria-table.tsx`** — bảng tiêu chí: cột STT | Nội dung | thao tác (nút sửa + xóa icon). Dùng table đơn giản bằng primitives `@/components/ui` (không cần DataGrid). Props: `criteria`, `onEdit(c)`, `onDelete(c)`. Empty state "Chưa có tiêu chí nào".

- [ ] **Step 7: `inspection-tables-page.tsx`** — master-detail như `groups/pages/material-groups-page.tsx`:
  - Trái: Card + `InspectionTableList` + nút "Thêm bảng".
  - Phải: khi chọn bảng → form sửa thông tin bảng (`InspectionTableForm` generated) + `InspectionCriteriaTable` + nút "Thêm tiêu chí". Idle state khi chưa chọn.
  - Thêm/sửa/xóa tiêu chí cập nhật `criteria` rồi `upsertInspectionTable(updatedTable)`.
  - Thêm bảng: tạo `InspectionTable` mới (`nextInspectionTableId()`, criteria []), upsert, chọn nó.
  - Xóa bảng: nếu có `materialModels.some(m => m.inspectionTableId === table.id)` → `toast.error('Không thể xóa: bảng đang gắn với mẫu vật tư.')`; ngược lại `ConfirmDeleteDialog` → `removeInspectionTable`.
  - Toast tiếng Việt cho mọi thao tác.

- [ ] **Step 8: Route** `constants/routes.ts` thêm trong `EXAMPLE`:

```ts
    MATERIAL_INSPECTIONS: '/example/materials/inspections',
```

- [ ] **Step 9: Đăng ký route** `example-routes.tsx`: lazy import `InspectionTablesPage` + `<Route path={ROUTES.EXAMPLE.MATERIAL_INSPECTIONS} ...>` trong khối `<MainLayout>` (theo mẫu các route material khác).

- [ ] **Step 10: Menu** `config/menu.config.tsx`: thêm item sau "Mẫu vật tư":

```tsx
      {
        label: 'Bảng kiểm định',
        icon: ClipboardCheck,
        path: ROUTES.EXAMPLE.MATERIAL_INSPECTIONS,
      },
```
Import `ClipboardCheck` từ `lucide-react`. Nếu `menu.config.test.ts` so khớp số item / path → cập nhật test cho khớp.

- [ ] **Step 11: Build + test**

Run: `npm run build` → PASS. `npm run test:run` → PASS (sửa `menu.config.test.ts` nếu cần).

- [ ] **Step 12: Commit** `feat(material): inspection checklist page with table + criteria CRUD`.

---

## Task 4: Field "Quản lý an toàn" + preview checklist trên form mẫu

**Files:**
- Modify: `models/material-model.schema.ts`, `models/form/material-model.form.fixture.ts`, `models/components/material-model-form.generated.tsx` (re-gen + own), `models/components/material-model-wizard.tsx`, `models/pages/material-model-editor-page.tsx`, `models/components/material-model-form.generated.tsx` map fn.

**Interfaces consumed:** `InspectionTable` từ Task 1, store từ Task 2.

- [ ] **Step 1: Schema** `models/material-model.schema.ts` — thêm field + refine. Mở file, thêm vào object schema `isSafetyManaged: z.boolean()`, `inspectionTableId: z.string().optional()`, và `.superRefine` (hoặc `.refine`) ở cuối: nếu `isSafetyManaged && !inspectionTableId` → issue path `['inspectionTableId']` message `'Chọn bảng kiểm định'`. Cập nhật `materialModelDefaultValues` (Step 4) tương ứng.

- [ ] **Step 2: Fixture** `models/form/material-model.form.fixture.ts` — thêm 2 field sau `description`:
  - `{ kind: 'switch', name: 'isSafetyManaged', label: 'Quản lý an toàn', width: 'full' }`
  - `{ kind: 'select', name: 'inspectionTableId', label: 'Bảng kiểm định', width: 'normal', placeholder: 'Chọn bảng kiểm định', optionsFrom: 'prop' }`

- [ ] **Step 3: Re-gen ra scratch rồi reconcile** (file generated đang được sở hữu, có conditional preview sẽ thêm tay — đừng đè mất):

Run: `npm run gen:form -- src/examples/material/models/form/material-model.form.fixture.ts /tmp/material-model-form.scratch.tsx`
Rồi copy phần JSX field `isSafetyManaged` + `inspectionTableId` và prop `inspectionTableIdOptions` từ scratch vào `material-model-form.generated.tsx` thật. Xóa file scratch.

- [ ] **Step 4: Sửa generated (owned)** `material-model-form.generated.tsx`:
  - `materialModelDefaultValues`: thêm `isSafetyManaged: false`, `inspectionTableId: ''`.
  - `mapMaterialModelToFormValues`: thêm `isSafetyManaged: entity.isSafetyManaged ?? false`, `inspectionTableId: entity.inspectionTableId ?? ''`.
  - Props `MaterialModelFormProps`: thêm `inspectionTableIdOptions: { value: string; label: string }[]` và `inspectionTables: InspectionTable[]` (cho preview).
  - Render: field `inspectionTableId` + preview chỉ khi `form.watch('isSafetyManaged')`. Preview đọc bảng theo id, render danh sách `criteria` read-only (STT + nội dung). Ví dụ:

```tsx
const isSafetyManaged = form.watch('isSafetyManaged');
const selectedTableId = form.watch('inspectionTableId');
const previewTable = inspectionTables.find((t) => t.id === selectedTableId);
// ...trong grid, sau field isSafetyManaged:
{isSafetyManaged && (
  <div className="md:col-span-12 flex flex-col gap-3">
    {/* FormField inspectionTableId (select, optionsFrom prop) */}
    {previewTable && (
      <div className="rounded-admin-control border border-border bg-admin-surface-alt p-3">
        <p className="mb-2 text-sm font-medium">Checklist: {previewTable.name}</p>
        <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
          {previewTable.criteria.map((c) => (
            <li key={c.id}>{c.order}. {c.content}</li>
          ))}
        </ol>
      </div>
    )}
  </div>
)}
```
Import `import type { InspectionTable } from '../../model/inspection-table';`.

- [ ] **Step 5: Wizard** `material-model-wizard.tsx` — thêm props `inspectionTableIdOptions` + `inspectionTables`, truyền xuống `<MaterialModelForm ...>` (bước 1).

- [ ] **Step 6: Editor page** `material-model-editor-page.tsx`:
  - Lấy `inspectionTables` từ `useMaterialCatalogStore()`.
  - `inspectionTableIdOptions = inspectionTables.map(t => ({ value: t.id, label: t.name }))`.
  - Truyền `inspectionTableIdOptions` + `inspectionTables` vào `<MaterialModelWizard>`.
  - `handleSubmit`: map `isSafetyManaged: values.isSafetyManaged`, `inspectionTableId: values.isSafetyManaged ? values.inspectionTableId || undefined : undefined` vào `MaterialModel`.

- [ ] **Step 7: Build + test** → PASS.
- [ ] **Step 8: Commit** `feat(material): safety-managed checklist on material model form`.

---

## Task 5: Cây nhóm + lọc trong trang Mẫu vật tư

**Files:**
- Create: `lib/filter-models-by-group.ts`, `lib/filter-models-by-group.test.ts`
- Modify: `models/pages/material-models-page.tsx`

**Interfaces consumed:** `getSelfAndDescendantIds` từ `groups/group-tree`, `MaterialGroupTree`, `buildGroupTree`.

- [ ] **Step 1: Test trước** `lib/filter-models-by-group.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterModelsByGroup } from './filter-models-by-group';
import type { MaterialModel } from '../model/material-model';
import type { MaterialGroup } from '../model/material-group';

const groups: MaterialGroup[] = [
  { id: 'g1', code: 'A', name: 'A', parentId: null, sortOrder: 1 },
  { id: 'g2', code: 'B', name: 'B', parentId: 'g1', sortOrder: 1 },
];
const models = [
  { id: 'm1', groupId: 'g1' },
  { id: 'm2', groupId: 'g2' },
] as MaterialModel[];

it('null group trả tất cả', () => {
  expect(filterModelsByGroup(models, groups, null)).toHaveLength(2);
});
it('nhóm cha gồm cả model nhóm con', () => {
  expect(filterModelsByGroup(models, groups, 'g1').map((m) => m.id)).toEqual(['m1', 'm2']);
});
it('nhóm con chỉ model của nó', () => {
  expect(filterModelsByGroup(models, groups, 'g2').map((m) => m.id)).toEqual(['m2']);
});
```

- [ ] **Step 2: Run test → FAIL** `npm run test:run -- filter-models-by-group`.

- [ ] **Step 3: Implement** `lib/filter-models-by-group.ts`:

```ts
import { getSelfAndDescendantIds } from '../groups/group-tree';
import type { MaterialGroup } from '../model/material-group';
import type { MaterialModel } from '../model/material-model';

export function filterModelsByGroup(
  models: MaterialModel[],
  groups: MaterialGroup[],
  groupId: string | null,
): MaterialModel[] {
  if (!groupId) return models;
  const ids = getSelfAndDescendantIds(groups, groupId);
  return models.filter((model) => ids.has(model.groupId));
}
```
(Kiểm tra chữ ký `getSelfAndDescendantIds(groups, id): Set<string>` trong `groups/group-tree.ts`; nếu khác, điều chỉnh.)

- [ ] **Step 4: Run test → PASS.**

- [ ] **Step 5: Sửa `material-models-page.tsx`** thành layout 2 cột (giống groups page outer `flex ... xl:flex-row`):
  - State `selectedGroupId: string | null`.
  - Trái: Card "Cây nhóm vật tư" + nút/dòng "Tất cả" (set null) + `MaterialGroupTree` (nodes = `buildGroupTree(MATERIAL_GROUPS_MOCK)`, `selectedId={selectedGroupId}`, `modelCountByGroup` = đếm model theo group, `onSelect={setSelectedGroupId}`, `onAddChild` → no-op hoặc ẩn). Giữ ô tìm keyword.
  - Phải: bảng hiện tại nhưng `data` = `filterModelsByGroup(models, MATERIAL_GROUPS_MOCK, selectedGroupId)` rồi lọc keyword.
  - `MaterialGroupTree` yêu cầu `onAddChild` — truyền hàm rỗng `() => {}` (trang này không tạo nhóm).

- [ ] **Step 6: Build + test → PASS.**
- [ ] **Step 7: Commit** `feat(material): group tree filter on material models page`.

---

## Task 6: Chọn Nhóm trước Mẫu ở trang tạo/sửa vật tư

**Files:**
- Modify: `material.schema.ts`, `form/material.form.fixture.ts`, `components/material-form.generated.tsx` (re-gen + own), `pages/material-editor-page.tsx`

- [ ] **Step 1: Schema** `material.schema.ts` — thêm `groupId: z.string()` (không required; chỉ hỗ trợ UI). Không thêm vào `Material` model.

- [ ] **Step 2: Fixture** `form/material.form.fixture.ts` — thêm field `select` `groupId` "Nhóm" (optionsFrom prop, placeholder "Chọn nhóm") **trước** field `modelId`.

- [ ] **Step 3: Re-gen ra scratch + reconcile** vào `components/material-form.generated.tsx` (file owned, có DeviceSpecField + onModelChange tay — giữ nguyên):

Run: `npm run gen:form -- src/examples/material/form/material.form.fixture.ts /tmp/material-form.scratch.tsx`
Copy JSX field `groupId` + prop `groupIdOptions` + `onGroupChange` vào generated thật. Field `groupId` đặt trước `modelId`. Xóa scratch.

- [ ] **Step 4: Sửa generated (owned)** `material-form.generated.tsx`:
  - `materialDefaultValues`: thêm `groupId: ''`.
  - `mapMaterialToFormValues`: thêm `groupId: ''` (sẽ được set ở page khi sửa).
  - Props: thêm `groupIdOptions`, `onGroupChange?: (groupId: string) => void`.
  - Field `groupId` select: `onValueChange` gọi `field.onChange(value)` + `onGroupChange?.(value)`. `onGroupChange` ở page sẽ clear `modelId` + `specValues`.

- [ ] **Step 5: Sửa `material-editor-page.tsx`:**
  - Thêm `watchedGroupId = form.watch('groupId')`.
  - `groupIdOptions` = `MATERIAL_GROUPS_MOCK` map (label có thụt cấp như `material-model-editor-page.tsx`).
  - `modelIdOptions` lọc: `filterModelsByGroup(materialModels, MATERIAL_GROUPS_MOCK, watchedGroupId || null)` rồi map. (import helper Task 5.)
  - `onGroupChange`: `form.setValue('modelId', ''); form.setValue('specValues', []);`.
  - Truyền `groupIdOptions` + `onGroupChange` xuống `<MaterialForm>`.
  - Khi sửa (`editing`): trong `form.reset`, set `groupId` = `modelById.get(editing.modelId)?.groupId ?? ''` để select Nhóm hiển thị đúng.
  - Submit không đụng `groupId` (Material không có field này).

- [ ] **Step 6: Build + test → PASS.**
- [ ] **Step 7: Commit** `feat(material): group selector filters model select on device form`.

---

## Task 7: Verify tổng + tài liệu

- [ ] **Step 1:** `npm run build` → PASS.
- [ ] **Step 2:** `npm run test:run` → PASS.
- [ ] **Step 3:** Lint changed files: `npm run lint` (auto-fix chấp nhận được).
- [ ] **Step 4: Commit** nếu lint sửa gì: `chore: lint fixes`.

---

## Self-Review (đã kiểm)

- Spec coverage: trang kiểm định (T3), field an toàn + preview (T4), cây nhóm + lọc mẫu (T5), nhóm→mẫu form vật tư (T6), mock palăng + nhóm + spec + value set (T1). ✔
- Type nhất quán: `InspectionTable`/`InspectionCriterion`, `isSafetyManaged`/`inspectionTableId`, `filterModelsByGroup`, `getSelfAndDescendantIds`. ✔
- Builder: form mới/đổi đều qua `gen:form` rồi own. ✔
- Rủi ro cần kiểm khi chạy: chữ ký `getSelfAndDescendantIds`, cách `materialModelFormSchema` đang khai báo (object vs đã refine) để chèn refine đúng, `menu.config.test.ts` có assert path/đếm item.
