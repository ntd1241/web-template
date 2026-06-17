# Component Usage Guide (hub)

> Tài liệu chuẩn để agent/dev biết **dùng component nào của project** thay cho HTML thô.
> Mục tiêu: mọi trang quản trị được lắp ráp từ `src/components/ui/*`, không viết lại `<button>`,
> `<input>`, `<table>`… thủ công.

Đây là **hub**: nguyên tắc + bảng tra cứu + checklist. Chi tiết cách dùng từng component nằm ở
[`docs/components/`](./components/); tiện ích `src/lib/*` ở [`docs/07-lib-utilities.md`](./07-lib-utilities.md).
Người giám sát (xem `CLAUDE.md`) review theo đúng các quy ước ở đây.

---

## 0. Nguyên tắc

- **Base component chỉ sống ở `src/components/ui/`.** Không tạo lại Button/Input/Table ở feature.
- **Không hardcode màu hex.** Component dùng class token semantic (`bg-card`, `bg-muted`,
  `bg-secondary`, `bg-field`, `border-border`, `text-foreground`, `text-muted-foreground`,
  `text-secondary-foreground`...). Class `admin-*` là palette-only và chỉ dùng trực tiếp cho status
  colors, admin radii, và layout dims. Token định nghĩa ở `src/styles/globals.css` (`@theme inline`).
- **Style chung sửa ở component/token, không vá ở trang.** Nếu default của một UI component chưa khớp
  template, sửa default của component đó (hoặc token), đừng copy class thô vào page.
- **Một trang quản lý không được chứa primitive thô** (`<button> <input> <table> <thead> <tbody>
  <tr> <td> <th>`) cho các nhu cầu tái sử dụng. `div`/`span` làm layout thì được.
- Import theo nhóm `@/components/ui/...` (prettier tự sắp xếp theo `.prettierrc`).

Kiểm tra nhanh trước khi nói "đã xong":

```bash
rg -n "<button|<input|<table|<thead|<tbody|<tr|<td|<th" src/pages/<your-page>.tsx   # phải rỗng
npm run build                                                                        # phải exit 0
```

### 0.1 Style admin đã nằm sẵn trong component — ĐỪNG vá lại ở page

Concept admin đã được nướng vào **default** của component dùng chung. Page chỉ cần lắp ráp, không
thêm class style. Nếu cần đổi diện mạo chung, **sửa default của component/token**, không override per-page.

- **Bảng (`DataGrid`/`DataGridTable`)** mặc định: header **sticky** nền `bg-muted`, nhãn header
  **chữ thường** (`normal-case`) 12px `text-secondary-foreground` (xanh lam), cell `px-6 py-3`,
  row hover `bg-field`. → Dùng `DataGrid` là có sẵn, **không** truyền `tableClassNames` để lặp lại.
- **Input/Textarea/Select** mặc định nền xám nhẹ `bg-field`, **trắng khi focus/mở**. →
  **Không** thêm `bg-...` cho ô tìm kiếm/dropdown ở page.
- Chỉ truyền `tableClassNames`/`className` khi thật sự **đặc thù 1 trang** (vd `min-w` cột), không phải
  để dựng lại look chung.

> Quy ước này được áp dụng từ `data-grid.tsx`, `data-grid-table.tsx`, `input.tsx`, `textarea.tsx`,
> `select.tsx`. Đổi diện mạo admin chung = sửa các file này (hoặc token trong `globals.css`).

### 0.2 Default text tiếng Việt + hợp lý — gọi component là đủ

Template là **tiếng Việt mặc định** (xem `docs/02`). Mọi text mặc định của component dùng chung
(label, mô tả, empty state, loading, placeholder, info phân trang…) phải là **tiếng Việt và hợp lý
sẵn**, để page chỉ cần `<Component />` mà không phải truyền prop để "dịch" lại.

- **Nếu thấy một page đang truyền prop chỉ để đổi text mặc định sang tiếng Việt → đó là dấu hiệu phải
  sửa default của component, không phải vá ở page.** Ví dụ đã xử lý:
  - `DataGridPagination` default: `sizesDescription="dòng"`, `info="{count} kết quả"`,
    `sizesLabel=""` (trước là `'Show' / 'per page' / '{from} - {to} of {count}'`). →
    Giờ chỉ cần `<DataGridPagination />`.
  - `DataGridTable` empty/loading fallback: `"Không có dữ liệu"` / `"Đang tải..."`
    (trước là `'No data available'` / `'Loading...'`).
- Page **chỉ** truyền các prop text khi **thật sự khác** nhu cầu mặc định (vd một bảng muốn
  `info="{from}-{to} trên {count}"`), không phải để dịch.
- Nguồn chữ chung nên tiến tới lấy từ i18n catalog (`src/i18n/messages`, namespace `common.*`)
  khi component được wire i18n; trước mắt hardcode tiếng Việt ở default là chấp nhận được.

---

## 1. Bảng tra cứu: HTML thô → Component project

| Nhu cầu | Dùng component | Import từ | Chi tiết |
|---|---|---|---|
| Khung thẻ/section (header, body, footer) | `Card`, `CardHeader`, `CardTitle`, `CardToolbar`, `CardTable`, `CardFooter`… | `@/components/ui/card` | — |
| Nút bấm, nút icon, CTA | `Button` (+ `ButtonArrow`) | `@/components/ui/button` | [button.md](./components/button.md) |
| Ô input / ô có icon-affix | `Input`, `InputWrapper`, `InputGroup`, `InputAddon` | `@/components/ui/input` | [forms.md](./components/forms.md) |
| Ô search debounced + clear | `SearchInput` | `@/components/ui/inputs/search-input` | [forms.md](./components/forms.md#searchinput--ô-tìm-kiếm-debounced--nút-xóa) |
| Select có tìm kiếm (1 lựa chọn) | `Combobox` | `@/components/ui/combobox` | [forms.md](./components/forms.md#combobox--select-có-ô-tìm-kiếm-single-select) |
| Chọn nhiều + chip | `MultiSelect` | `@/components/ui/multi-select` | [forms.md](./components/forms.md#multiselect--chọn-nhiều--chip) |
| Ô số định dạng VN | `NumericInput` | `@/components/ui/inputs/numeric-input` | [forms.md](./components/forms.md#numericinput--ô-số-định-dạng-vn) |
| Select/dropdown ngắn cố định | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` | `@/components/ui/select` | [forms.md](./components/forms.md) |
| Nhãn trạng thái / vai trò | `Badge` (+ `BadgeDot`, `BadgeButton`) | `@/components/ui/badge` | [display.md](./components/display.md) |
| Badge trạng thái theo config | `StatusBadge` + `StatusBadgeConfig` | `@/components/ui/data-grid-columns` | [display.md](./components/display.md#statusbadge--badge-theo-config-dùng-trong-datagrid) |
| Avatar chữ cái / ảnh | `Avatar`, `AvatarFallback`, `AvatarImage` | `@/components/ui/avatar` | [display.md](./components/display.md) |
| Thời gian tương đối ("x phút trước") | `RelativeTime` | `@/components/ui/relative-time` | [display.md](./components/display.md#relativetime--x-phút-trước) |
| **Bảng danh sách có phân trang** | `DataGrid` + `DataGridTable` + `DataGridPagination` + `useReactTable` | `@/components/ui/data-grid*` | [data-grid.md](./components/data-grid.md) |
| Định nghĩa cột bảng (typed) | `createColumnHelpers<T>()`, `usePersistedColumnVisibility` | `@/components/ui/data-grid-columns` | [data-grid.md](./components/data-grid.md#2-column-factory--createcolumnhelperstrow) |
| Bảng nhỏ KHÔNG phân trang (top 5) | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `@/components/ui/table` | — |
| Vùng cuộn cho bảng | `ScrollArea`, `ScrollBar` | `@/components/ui/scroll-area` | — |
| Checkbox / Switch / Radio | `Checkbox`, `Switch`, `RadioGroup` | `@/components/ui/{checkbox,switch,radio-group}` | — |
| Form + validation | `Form*` (RHF) + factory schema | `@/components/ui/form`, `@/lib/validation` | [07-lib-utilities](./07-lib-utilities.md#validation) |
| Modal / drawer / confirm | `Dialog`, `Sheet`/`Drawer`, `AlertDialog` | `@/components/ui/{dialog,sheet,drawer,alert-dialog}` | — |
| Tabs, Tooltip, Dropdown menu | `Tabs`, `Tooltip`, `DropdownMenu` | `@/components/ui/{tabs,tooltip,dropdown-menu}` | — |
| Icon | `lucide-react` | `lucide-react` | — |
| Số/tiền/ngày/lỗi/search (logic) | `lib/format`, `lib/date`, `lib/errors`, `lib/search` | `@/lib/*` | [07-lib-utilities](./07-lib-utilities.md) |

> Danh sách đầy đủ primitive: xem thư mục `src/components/ui/`. Trước khi tạo mới, kiểm tra ở đó.

---

## 2. Chi tiết theo component

- [components/button.md](./components/button.md) — Button (variant, size, mode).
- [components/forms.md](./components/forms.md) — Input, SearchInput, Combobox, MultiSelect, NumericInput, Select/Textarea.
- [components/display.md](./components/display.md) — Badge, StatusBadge, Avatar, RelativeTime.
- [components/data-grid.md](./components/data-grid.md) — DataGrid, column factory, pagination, persist visibility.
- [07-lib-utilities.md](./07-lib-utilities.md) — validation, format, date, search, errors.

> Tham chiếu sống (đọc code để copy): `src/examples/employees/` là module data-table chuẩn.

---

## 3. Checklist review (người giám sát dùng)

- [ ] `rg` không còn primitive thô trong page.
- [ ] Không có `bg-[#...]` / màu hex mới; dùng class token semantic / `admin-*` (palette-only).
- [ ] Danh sách phân trang dùng `DataGrid` + `useReactTable`, không phải `<table>` hay primitive `Table`.
- [ ] Cột bảng khai qua `createColumnHelpers` (factory), không viết `ColumnDef` thủ công khi có builder phù hợp.
- [ ] Không truyền prop text chỉ để dịch — default component đã tiếng Việt (§0.2).
- [ ] Nút icon có `aria-label`; copy tiếng Việt cho label/placeholder/empty/confirm.
- [ ] Named export cho component/page; `cn()` cho class điều kiện; không `any`.
- [ ] `npm run build` exit 0; với UI, kiểm tra ở 1366px và 1920px khớp thiết kế.
