# Material Catalog Module — Spec

Demo use-case: hệ thống quản lý vật tư cho khách. Bổ sung phần "thượng nguồn" còn thiếu để
`Material` (thiết bị thật, đã có) trở thành một hệ thống hoàn chỉnh: **nhóm vật tư**, **danh mục
thông số kỹ thuật**, và **mẫu vật tư**. Mock-first, nằm trong `src/examples/material/`.

## Bối cảnh & mục tiêu

Hiện trạng:

- `Material` (`model/material.ts`) là **thiết bị thật**: `id, name, code, imageUrl, group (enum cứng), tags`.
- `MaterialGroup` là **enum hardcode** 4 giá trị.
- `MaterialSpecification` là cặp `{name, value}` phẳng, chỉ render ở trang public.

Mục tiêu: nhiều thiết bị cùng một **mẫu** (vd 5 chiếc iPhone 17 Pro = 5 thiết bị, 1 mẫu) để thống kê
gọn. Mẫu mang thông tin cơ bản + thông số kỹ thuật chọn từ danh mục dùng chung. Thiết bị thật gắn vào
mẫu, kế thừa thông số cố định và tự chọn/nhập các thông số biến thể (vd màu).

## Quyết định đã chốt

| Vấn đề | Chốt |
|---|---|
| Cách thông số ứng xử ở thiết bị | 3 chế độ trên mỗi thông số gán vào mẫu: **Cứng** / **Tự nhập** / **Chọn từ list** |
| Nhóm vật tư | Phân cấp cây cha–con |
| Kiểu dữ liệu thông số | Text · Số + đơn vị · Chọn 1 · Chọn nhiều · Boolean · Ngày |
| Phạm vi đợt này | 3 trang quản lý + gắn `modelId` vào `Material`, hiển thị thông số kế thừa |

## Mô hình thực thể

```
NhómVậtTư (cây) ──1:n──► MẫuVậtTư ──1:n──► VậtTư (thiết bị thật)
                            │
        DanhMụcThôngSố ──n:n┘  (qua bảng gán: mẫu × thông số × chế độ × giá trị)
```

### 1. MaterialGroup — Nhóm vật tư (cây)

```ts
interface MaterialGroup {
  id: string;
  code: string;
  name: string;
  parentId: string | null;   // null = nhóm gốc
  description?: string;
  sortOrder: number;
  isActive: boolean;
}
```

- Hiển thị dạng cây; mỗi node có số mẫu trực thuộc.
- Ràng buộc: không cho chọn chính nó hoặc hậu duệ làm `parentId` (tránh vòng).
- Xóa nhóm còn con hoặc còn mẫu → chặn, báo lỗi tiếng Việt.

### 2. SpecDefinition — Danh mục thông số kỹ thuật

*Định nghĩa* thông số tái dùng (không phải giá trị).

```ts
type SpecDataType =
  | 'text'
  | 'number'          // kèm đơn vị
  | 'single_select'
  | 'multi_select'
  | 'boolean'
  | 'date';

interface SpecOption {
  id: string;
  label: string;       // "Xanh", "Đỏ"
  value: string;       // mã ổn định
  colorHex?: string;   // optional, cho thông số màu hiển thị swatch
}

interface SpecDefinition {
  id: string;
  code: string;
  name: string;        // "Màu sắc", "Trọng lượng"
  dataType: SpecDataType;
  unit?: string;       // chỉ number: 'kg' | 'g' | 'inch' | 'mm'...
  options?: SpecOption[];   // chỉ single_select | multi_select: master list
  description?: string;
  isActive: boolean;
}
```

Ràng buộc theo `dataType`: `unit` chỉ cho `number`; `options` chỉ cho `*_select` và phải ≥ 1 option.

### 3. MaterialModel — Mẫu vật tư

```ts
type SpecDeviceMode = 'fixed' | 'input' | 'select'; // Cứng | Tự nhập | Chọn từ list

// Giá trị thông số, hình dạng phụ thuộc dataType của SpecDefinition:
//  text          -> string
//  number        -> { amount: number; unit?: string }
//  single_select -> optionId
//  multi_select  -> optionId[]
//  boolean       -> boolean
//  date          -> ISO date string
type SpecValue = string | number | boolean | string[] | { amount: number; unit?: string };
// CHỐT: dùng union. Đọc/ghi/validate qua helper theo dataType (type-guard tập trung ở
// lib/spec-value.ts) — KHÔNG truy cập trực tiếp shape ở component để tránh sai kiểu.

interface MaterialModelSpec {
  specDefinitionId: string;
  deviceMode: SpecDeviceMode;
  modelValue?: SpecValue;       // fixed: giá trị kế thừa | input: default optional
  allowedOptionIds?: string[];  // select: tập con của SpecDefinition.options
  isRequired: boolean;
  sortOrder: number;
}

interface MaterialModel {
  id: string;
  code: string;
  name: string;              // "iPhone 17 Pro"
  description?: string;
  origin?: string;           // xuất xứ
  groupId: string;
  imageUrls: string[];
  specs: MaterialModelSpec[];
  isActive: boolean;
}
```

### 4. Material — Thiết bị thật (refactor)

```ts
interface MaterialSpecValue {
  specDefinitionId: string;
  value: SpecValue;
}

interface Material {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  modelId: string;              // NEW — FK MaterialModel
  specValues: MaterialSpecValue[]; // chỉ override cho deviceMode 'input' | 'select'
  tags: string[];
  // group cũ: suy ra từ model.groupId (giữ getter/derive cho tương thích bảng & public)
}
```

## Cơ chế 3 chế độ (mấu chốt)

Hai trục độc lập:

- **Kiểu dữ liệu** (ở danh mục): value hợp lệ trông như thế nào.
- **Chế độ ở thiết bị** (gán vào mẫu): ai đặt giá trị và khi nào.

| Chế độ | Mẫu lưu gì | Thiết bị làm gì | Hợp với kiểu |
|---|---|---|---|
| **Cứng** | `modelValue` | Kế thừa, **read-only** | mọi kiểu |
| **Tự nhập** | `modelValue` (default, optional) | Tự nhập khi tạo, hợp kiểu dữ liệu | mọi kiểu |
| **Chọn từ list** | `allowedOptionIds` (tập con master) | Chọn 1 (single) / nhiều (multi) trong tập con | chỉ `single_select` / `multi_select` |

Ví dụ màu sắc: `SpecDefinition`("Màu sắc", `single_select`, options = bảng màu đầy đủ) → gán vào mẫu
iPhone 17 Pro với `deviceMode='select'`, `allowedOptionIds=[xanh, đỏ, vàng]` → thiết bị thật chọn 1
trong 3. Trọng lượng: `number`+`g`, `deviceMode='fixed'`, `modelValue={amount:187,unit:'g'}` → thiết bị
kế thừa.

**Effective specs của thiết bị** = duyệt `model.specs`:
- `fixed` → `model.modelValue` (read-only)
- `input` → `device.specValues[…]` nếu có, else `model.modelValue`
- `select` → `device.specValues[…]` (phải nằm trong `allowedOptionIds`)

## Trang & UI

Tất cả compose `src/components/ui`, dùng builder registry trước khi viết tay (table/form/dialog). Copy
tiếng Việt, trạng thái loading/empty/error.

### A. Nhóm vật tư — `/example/materials/groups`
- **Cây nhóm (tree) + panel chi tiết** (2 cột): chọn node bên trái → chi tiết/sửa bên phải.
- Thêm/sửa/xóa, đổi nhóm cha, kéo thứ tự. Panel hiện: tên, mã, mô tả, trạng thái, số mẫu trực thuộc.
- Chặn xóa khi còn con/mẫu.

### B. Danh mục thông số — `/example/materials/specs`
- Bảng thông số: tên, mã, kiểu dữ liệu (badge), đơn vị, số option, trạng thái.
- Dialog tạo/sửa: chọn `dataType` → form đổi theo kiểu (number hiện đơn vị; *_select hiện trình quản
  lý options với label + optional màu).

### C. Mẫu vật tư — `/example/materials/models`
- Bảng mẫu: ảnh, tên, mã, nhóm, xuất xứ, số thông số, số thiết bị, trạng thái.
- Form tạo/sửa dạng **wizard** (2 bước, có thanh tiến trình, validate từng bước trước khi sang bước
  kế, xem lại được):
  1. **Thông tin cơ bản**: tên, mã, mô tả, xuất xứ, nhóm (chọn từ cây), ảnh.
  2. **Thông số**: thêm từ danh mục → mỗi dòng chọn **chế độ** (cứng/nhập/chọn) → editor giá trị đổi
     theo (cứng/nhập: nhập giá trị theo kiểu; chọn: tick tập con option). Đánh dấu bắt buộc, kéo thứ tự.

### D. Thiết bị thật (refactor) — `/example/materials`
- Thêm cột/bộ lọc theo **mẫu**. `group` suy ra từ mẫu.
- Form tạo/sửa thiết bị: chọn mẫu → render specs kế thừa: cứng (read-only), nhập (input), chọn
  (dropdown giới hạn `allowedOptionIds`). Lưu vào `specValues`.

## Cấu trúc file (đề xuất)

```
src/examples/material/
  model/
    material.ts                 # extend: modelId, specValues
    material-group.ts           # NEW
    spec-definition.ts          # NEW (SpecDataType, SpecOption, SpecValue)
    material-model.ts           # NEW (SpecDeviceMode, MaterialModelSpec)
  data/
    material-groups.mock.ts     # NEW — cây mẫu
    spec-definitions.mock.ts    # NEW — gồm "Màu sắc", "Trọng lượng"...
    material-models.mock.ts     # NEW — iPhone 17 Pro + vài mẫu
    materials.mock.ts           # update: gắn modelId + specValues
  lib/
    resolve-effective-specs.ts  # NEW — merge model.specs + device.specValues
  groups/pages/material-groups-page.tsx       # NEW
  specs/pages/spec-definitions-page.tsx       # NEW
  models/pages/material-models-page.tsx       # NEW
  pages/materials-management-page.tsx         # update
```

Routes: thêm `MATERIAL_GROUPS`, `MATERIAL_SPECS`, `MATERIAL_MODELS` vào `constants/routes.ts` và đăng
ký trong `examples/example-routes.tsx` (trong `MainLayout`).

## Dữ liệu mock định hướng

- Nhóm: `Thiết bị di động > Điện thoại`, `Văn phòng`, `An toàn lao động > PCCC`... (giữ 4 nhóm cũ làm
  nhánh để mock thiết bị hiện tại không vỡ).
- Thông số: Màu sắc (single_select + swatch), Dung lượng (single_select), Trọng lượng (number/g), Kích
  thước màn hình (number/inch), Chống nước (boolean), Ngày sản xuất (date), Chất liệu (text), Cổng kết
  nối (multi_select).
- Mẫu iPhone 17 Pro: Màu = select[Xanh/Đỏ/Vàng], Dung lượng = select[256/512GB], Trọng lượng = fixed
  187g, Chống nước = fixed true.
- Thiết bị `601af811…` (đang link ở trang public) phải gắn `modelId` hợp lệ.

## Tương thích & rủi ro

- **Trang public detail** đang đọc `MATERIAL_SPECIFICATIONS` tĩnh: đợt này giữ nguyên nguồn hiển thị,
  KHÔNG nối vào effective specs để tránh blast radius. Ghi chú là bước phase sau.
- `materials-columns.generated.tsx` & fixtures: cập nhật theo `Material` mới (derive group), chạy lại
  builder nếu cột do builder sở hữu — không sửa tay file generated.

## Verification

- Unit test `resolve-effective-specs` cho cả 3 chế độ × các kiểu dữ liệu (gồm select ngoài
  `allowedOptionIds` → loại).
- Test render form thông số đổi theo `dataType` và đổi theo `deviceMode`.
- `npm run build` + test có mục tiêu cho vùng đổi. Browser preview chỉ khi layout cây/wizard cần mắt.
- Kiểm tra ràng buộc xóa nhóm (còn con/mẫu) và validate option list.

## Ngoài phạm vi (phase sau)

- Nối trang public detail vào effective specs.
- Báo cáo/thống kê theo mẫu.
- Import/export danh mục, lịch sử thay đổi thông số.
