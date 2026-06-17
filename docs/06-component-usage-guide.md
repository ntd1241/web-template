# Component Usage Guide

> Tài liệu chuẩn để agent/dev biết **dùng component nào của project** thay cho HTML thô.
> Mục tiêu: mọi trang quản trị được lắp ráp từ `src/components/ui/*`, không viết lại `<button>`,
> `<input>`, `<table>`… thủ công.

Đây là tài liệu tham chiếu chính khi thực hiện việc "biến trang dùng component thô sang component
của project". Người giám sát (xem `CLAUDE.md`) sẽ review theo đúng các quy ước ở đây.

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

| Nhu cầu | Dùng component | Import từ |
|---|---|---|
| Khung thẻ/section có header, body, footer | `Card`, `CardHeader`, `CardHeading`, `CardTitle`, `CardDescription`, `CardToolbar`, `CardTable`, `CardContent`, `CardFooter` | `@/components/ui/card` |
| Nút bấm, nút icon, CTA | `Button` (+ `ButtonArrow`) | `@/components/ui/button` |
| Ô input | `Input`; ô có icon/affix: `InputWrapper` / `InputGroup` + `InputAddon` | `@/components/ui/input` |
| Nhãn trạng thái / vai trò | `Badge` (+ `BadgeDot`, `BadgeButton`) | `@/components/ui/badge` |
| Avatar chữ cái / ảnh | `Avatar`, `AvatarFallback`, `AvatarImage`, `AvatarStatus` | `@/components/ui/avatar` |
| **Bảng danh sách có phân trang** | `DataGrid` + `DataGridTable` + `DataGridPagination` + `useReactTable` | `@/components/ui/data-grid*`, `@tanstack/react-table` |
| Bảng nhỏ KHÔNG phân trang (top 5, sub-table) | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | `@/components/ui/table` |
| Vùng cuộn ngang/dọc cho bảng | `ScrollArea`, `ScrollBar` | `@/components/ui/scroll-area` |
| Select / dropdown chọn | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue` | `@/components/ui/select` |
| Checkbox / Switch / Radio | `Checkbox`, `Switch`, `RadioGroup` | `@/components/ui/{checkbox,switch,radio-group}` |
| Form + validation | `Form*` (RHF) + `zod` + `@hookform/resolvers` | `@/components/ui/form` |
| Modal / drawer / confirm | `Dialog`, `Sheet`/`Drawer`, `AlertDialog` | `@/components/ui/{dialog,sheet,drawer,alert-dialog}` |
| Tabs, Tooltip, Dropdown menu | `Tabs`, `Tooltip`, `DropdownMenu` | `@/components/ui/{tabs,tooltip,dropdown-menu}` |
| Icon | `lucide-react` (ưu tiên khi có icon phù hợp) | `lucide-react` |

> Danh sách đầy đủ primitive: xem thư mục `src/components/ui/`. Trước khi tạo mới, kiểm tra ở đó.

---

## 2. Button

Variant ổn định (giữ nguyên tên API): `primary` (CTA xanh template), `secondary`, `outline`, `ghost`,
`dashed`, `destructive`, `mono`. Size: `sm | md | lg | icon`. `mode="icon"` cho nút chỉ có icon.

```tsx
import { Plus, Filter, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

// CTA chính (nền xanh template)
<Button variant="primary">
  <Plus /> Cấp tài khoản
</Button>

// Nút icon 36px viền admin
<Button variant="outline" mode="icon" aria-label="Lọc danh sách">
  <Filter />
</Button>

// Action mềm trong dòng bảng
<Button variant="secondary" size="sm">
  <ShieldCheck /> Phân quyền
</Button>
```

- Nút icon **bắt buộc** có `aria-label`.
- Không tự đặt `h-9 px-4 bg-[#...]` — nếu default chưa đúng template, sửa default trong `button.tsx`.

---

## 3. Input (ô tìm kiếm có icon)

Ô search trong toolbar dùng `InputWrapper` bọc icon + `Input`:

```tsx
import { Search } from 'lucide-react';
import { Input, InputWrapper } from '@/components/ui/input';

<InputWrapper>
  <Search />
  <Input
    type="search"
    placeholder="Tìm kiếm theo trường"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</InputWrapper>
```

> Nền xám nhẹ + trắng-khi-focus là **default** (xem §0.1). Không thêm `bg-field`/`bg-white`
> vào `InputWrapper` ở page nữa.

---

## 4. Badge (vai trò & trạng thái)

Dùng `Badge` thay cho `<span>` thủ công; `BadgeDot` cho chấm trạng thái.

```tsx
import { Badge, BadgeDot } from '@/components/ui/badge';

// Trạng thái hoạt động
<Badge variant="success" appearance="light" className="gap-1.5">
  <BadgeDot className="bg-admin-success-dot opacity-100" />
  Hoạt động
</Badge>
```

Cho vai trò (Nhân viên / Chủ sở hữu / Quản lý) có màu riêng theo token admin: nếu cần biến thể ổn
định, **thêm semantic variant vào `badge.tsx`** (ví dụ `adminRoleEmployee`, `adminRoleOwner`,
`adminRoleManager`) thay vì rải class màu trong trang. Giữ đúng màu hiện tại của trang.

---

## 5. Avatar chữ cái

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

<Avatar className="size-9">
  <AvatarFallback className={cn('bg-gradient-to-br font-bold', avatarClasses[employee.avatar])}>
    {employee.initials}
  </AvatarFallback>
</Avatar>
```

Map gradient theo `avatar` giữ ở cấp trang (domain-specific) là chấp nhận được.

---

## 6. Bảng danh sách — DataGrid (pattern chuẩn)

Dùng cho **mọi danh sách quản lý có phân trang**. Ráp `useReactTable` → `DataGrid` → `Card` chứa
`DataGridTable` + `DataGridPagination`.

```tsx
import { useMemo, useState } from 'react';
import {
  ColumnDef,
  PaginationState,
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardFooter, CardTable } from '@/components/ui/card';

const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
const [sorting, setSorting] = useState<SortingState>([]);
const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

const columns = useMemo<ColumnDef<Employee>[]>(() => [
  {
    accessorKey: 'name',
    header: 'Nhân viên',
    cell: ({ row }) => <EmployeeCell employee={row.original} />,
    meta: { headerClassName: 'w-[36%]', cellClassName: 'px-6 py-3.5' },
  },
  // roles, status, actions…
], []);

const table = useReactTable({
  columns,
  data: filteredEmployees,
  pageCount: Math.ceil(filteredEmployees.length / pagination.pageSize),
  getRowId: (row) => row.username,
  state: { pagination, sorting, rowSelection },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

return (
  <DataGrid table={table} recordCount={filteredEmployees.length}>
    <Card>
      {/* CardHeader + toolbar */}
      <CardTable>
        <ScrollArea>
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardTable>
      <CardFooter>
        <DataGridPagination sizes={[10, 25, 50]} sizesLabel="" sizesDescription="dòng" info="{count} kết quả" />
      </CardFooter>
    </Card>
  </DataGrid>
);
```

Ghi chú quan trọng:

- Diện mạo admin (header sticky/HOA, cell `px-6`, hover row) là **default** (xem §0.1) — chỉ cần
  `<DataGrid>`, **không** truyền `tableLayout`/`tableClassNames` để dựng lại. Đổi look chung = sửa
  `data-grid.tsx` / `data-grid-table.tsx`.
- Độ rộng/căn lề cột đặt qua `meta.headerClassName` / `meta.cellClassName` (đã khai báo trong
  `data-grid.tsx`), không style trực tiếp `<th>/<td>` (vì DataGrid tự render bảng).
- `DataGridPagination.info` hỗ trợ placeholder `{from} {to} {count}`. Label tiếng Việt truyền qua
  props (`sizesDescription="dòng"`, `info="{count} kết quả"`).
- Tinh chỉnh style mặc định của bảng admin ở `data-grid-table.tsx` / `data-grid-pagination.tsx`
  hoặc qua `tableLayout` / `tableClassNames`, **không** quay lại viết `<table>` thô trong trang.
- Bảng nhỏ không phân trang (top-5, sub-table chi tiết): dùng primitive `Table` ở
  `@/components/ui/table`. **Không** dùng `Table` cho danh sách phân trang.

---

## 7. Checklist review (người giám sát dùng)

- [ ] `rg` không còn primitive thô trong page.
- [ ] Không có `bg-[#...]` / màu hex mới; dùng class token `admin-*`.
- [ ] Danh sách phân trang dùng `DataGrid` + `useReactTable`, không phải `<table>` hay primitive `Table`.
- [ ] Nút icon có `aria-label`; copy tiếng Việt cho label/placeholder/empty/confirm.
- [ ] Named export cho component/page; `cn()` cho class điều kiện; không `any`.
- [ ] `npm run build` exit 0; với UI, kiểm tra `/` ở 1366px và 1920px khớp thiết kế cũ.
