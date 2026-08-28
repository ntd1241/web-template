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

## OptionSelect — Select dữ liệu (single-select)

Khác `Select` thô ở chỗ **có ô tìm kiếm bỏ dấu** (qua `searchMatch`). Generic theo `T`.
`OptionSelect` là API single-select dùng cho dữ liệu; `@/components/ui/combobox` vẫn được giữ làm
alias tương thích.

```tsx
import { OptionSelect, type SelectOption } from '@/components/ui/option-select';

const options: SelectOption[] = [
  { value: 'nhan-vien', label: 'Nhân viên' },
  { value: 'quan-ly', label: 'Quản lý' },
];

<OptionSelect value={role} onChange={setRole} options={options} placeholder="Chọn vai trò" />
```

`SelectOption<T> = { value: string; label: ReactNode; searchableText?: string; group?: string; data?: T; disabled?: boolean }`

| Prop | Kiểu | Mặc định |
|---|---|---|
| `value` / `onChange` | `string` / `(v: string) => void` | `''` |
| `onSelect` | `(opt: SelectOption<T> \| undefined) => void` | — |
| `options` | `SelectOption<T>[]` | — |
| `placeholder` / `searchPlaceholder` / `emptyMessage` | `string` | `Chọn...` / `Tìm...` / `Không có kết quả` |
| `searchable` | `boolean` | `true` — ẩn ô tìm kiếm khi đặt `false` |
| `manualFilter` | `boolean` | `false` — bật khi tự lọc (async/server) |
| `renderOption` / `triggerContent` | render fn | — |

Chọn lại đúng giá trị đang chọn = bỏ chọn (`''`). Dùng `canDeselect={false}` cho field bắt buộc phải
giữ giá trị. Dùng `OptionSelect` thay cho `Select` thô khi danh sách là dữ liệu; chỉ giữ `Select`
thô cho các menu cần tự compose layout.

---

## MultiSelect — chọn nhiều + chip

Form field chọn nhiều: trigger hiển thị các lựa chọn (`+N` khi quá `maxChips`), dropdown có tìm
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
| `showSelectedOptionWrapper` | `boolean` | `false` — bật chip wrapper và nút xóa mặc định |
| `placeholder` / `searchPlaceholder` / `emptyMessage` | `string` | `Chọn...` / `Tìm...` / `Không có kết quả` |
| `searchMode` | `'popover' \| 'inline'` | `'popover'` — tìm trong dropdown; `inline` hiển thị ô tìm ngay trên trigger |

Nhóm 1 cấp qua `group`; số đếm qua `count`. Với `nestedOptions`, group và leaf đều được hiển thị,
group có thể chọn/bỏ chọn toàn bộ leaf. Search fuzzy giữ lại group cha khi leaf con khớp. Popover
**giữ mở** khi toggle (đúng UX multi-select).

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

- `OptionSelect searchable={false}` cho dropdown ngắn cố định, không cần tìm kiếm; dùng `OptionSelect`
  với `searchable` mặc định cho danh sách dữ liệu cần tìm. `Select` thô chỉ dành cho composition đặc biệt.
- `FilterToolbar` dùng `OptionSelect` với `triggerContent` để hiển thị nhãn và giá trị trong một
  control compact. `SelectValue` vẫn hỗ trợ `label` cho các composition low-level tùy biến.
- `Textarea`, `Checkbox`, `Switch`, `RadioGroup`: dùng primitive cùng tên trong `@/components/ui/*`.
- Validate form: ráp `Form*` (react-hook-form) + schema từ [`docs/07` validation factory](../07-lib-utilities.md#validation).
