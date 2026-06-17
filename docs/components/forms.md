# Form Inputs

> Chi tiết cho các ô nhập liệu. Hub: [`docs/06-component-usage-guide.md`](../06-component-usage-guide.md).
> Nguyên tắc chung (semantic token, default tiếng Việt, không vá style ở page) xem §0 của hub.

Tất cả ô nhập đều dùng nền `bg-field` + trắng khi focus là **default** — không thêm `bg-*` ở page.

---

## Input

Ô input cơ bản; có icon/affix thì bọc `InputWrapper` hoặc `InputGroup` + `InputAddon`.

```tsx
import { Search } from 'lucide-react';
import { Input, InputWrapper } from '@/components/ui/input';

<InputWrapper>
  <Search />
  <Input type="search" placeholder="Tìm kiếm theo trường" value={q} onChange={(e) => setQ(e.target.value)} />
</InputWrapper>
```

Variant size: `sm | md | lg` (mặc định `md`). `onChange` giữ chữ ký HTML chuẩn `(e) => e.target.value`.

---

## SearchInput — ô tìm kiếm debounced + nút xóa

Dùng khi cần search debounce (toolbar danh sách). Tự gói icon + nút clear (X). Import từ
`@/components/ui/inputs/search-input`.

```tsx
import { SearchInput } from '@/components/ui/inputs/search-input';

<SearchInput value={keyword} onSearch={setKeyword} placeholder="Tìm theo tên, username" />
```

| Prop | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|
| `value` | `string` | `''` | Giá trị hiển thị ban đầu, đồng bộ khi đổi từ ngoài |
| `onSearch` | `(value: string) => void` | — | Gọi **sau debounce**; nút clear gọi ngay với `''` |
| `debounceMs` | `number` | `300` | Đặt `0` nếu query phía dưới đã tự debounce (vd React Query hook) |

> Lưu ý: nếu hook lấy dữ liệu đã debounce sẵn thì truyền `debounceMs={0}` để khỏi debounce 2 lần.

---

## Combobox — Select có ô tìm kiếm (single-select)

Khác `Select` thô ở chỗ **có ô tìm kiếm bỏ dấu** (qua `searchMatch`). Generic theo `T`. Import từ
`@/components/ui/combobox`.

```tsx
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';

const options: ComboboxOption[] = [
  { value: 'nhan-vien', label: 'Nhân viên' },
  { value: 'quan-ly', label: 'Quản lý' },
];

<Combobox value={role} onChange={setRole} options={options} placeholder="Chọn vai trò" />
```

`ComboboxOption<T> = { value: string; label: ReactNode; searchableText?: string; data?: T; disabled?: boolean }`

| Prop | Kiểu | Mặc định |
|---|---|---|
| `value` / `onChange` | `string` / `(v: string) => void` | `''` |
| `onSelect` | `(opt: ComboboxOption<T> \| undefined) => void` | — |
| `options` | `ComboboxOption<T>[]` | — |
| `placeholder` / `searchPlaceholder` / `emptyMessage` | `string` | `Chọn...` / `Tìm...` / `Không có kết quả` |
| `manualFilter` | `boolean` | `false` — bật khi tự lọc (async/server) |
| `renderOption` / `triggerContent` | render fn | — |

Chọn lại đúng giá trị đang chọn = bỏ chọn (`''`). Dùng `Combobox` thay cho `Select` thô khi danh sách dài/cần tìm.

---

## MultiSelect — chọn nhiều + chip

Form field chọn nhiều: trigger hiển thị chip xóa được (`+N` khi quá `maxChips`), dropdown có tìm
kiếm + nhóm + "Chọn tất cả / Bỏ chọn tất cả". Import từ `@/components/ui/multi-select`.

```tsx
import { MultiSelect, type MultiSelectOption } from '@/components/ui/multi-select';

const options: MultiSelectOption[] = [
  { value: 'nhan-vien', label: 'Nhân viên', group: 'Vai trò' },
  { value: 'quan-ly', label: 'Quản lý', group: 'Vai trò', count: 12 },
];

<MultiSelect value={roles} onChange={setRoles} options={options} placeholder="Tất cả vai trò" />
```

`MultiSelectOption<T> = { value: string; label: ReactNode; searchableText?: string; group?: string; count?: number; data?: T; disabled?: boolean }`

| Prop | Kiểu | Mặc định |
|---|---|---|
| `value` / `onChange` | `string[]` / `(v: string[]) => void` | `[]` |
| `options` | `MultiSelectOption<T>[]` | — |
| `maxChips` | `number` | `2` — dư thì gom `+N` (giữ trigger 1 dòng) |
| `placeholder` / `searchPlaceholder` / `emptyMessage` | `string` | `Chọn...` / `Tìm...` / `Không có kết quả` |

Nhóm 1 cấp qua `group`; số đếm qua `count`. Popover **giữ mở** khi toggle (đúng UX multi-select).

---

## NumericInput — ô số định dạng VN

Bọc `react-number-format`, phân tách nghìn `.` / thập phân `,` kiểu VN. Cặp với
[`formatCurrencyVND`](../07-lib-utilities.md#format). Import từ `@/components/ui/inputs/numeric-input`.

```tsx
import { NumericInput } from '@/components/ui/inputs/numeric-input';

<NumericInput value={luong} onValueChange={setLuong} allowNegative={false} />
```

| Prop | Kiểu | Mặc định |
|---|---|---|
| `value` | `number \| string \| null` | — |
| `onValueChange` | `(value: number \| undefined) => void` | — (rỗng → `undefined`) |
| `thousandSeparator` / `decimalSeparator` | `string` | `.` / `,` |
| `allowNegative` / `decimalScale` | `boolean` / `number` | — |

---

## Select / Textarea / Checkbox / Switch

- `Select` thô (`@/components/ui/select`) cho dropdown ngắn cố định, không cần tìm kiếm. Cần tìm → `Combobox`.
- `Textarea`, `Checkbox`, `Switch`, `RadioGroup`: dùng primitive cùng tên trong `@/components/ui/*`.
- Validate form: ráp `Form*` (react-hook-form) + schema từ [`docs/07` validation factory](../07-lib-utilities.md#validation).
