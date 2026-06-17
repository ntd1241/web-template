# DataGrid — bảng danh sách phân trang

> Chi tiết bảng dữ liệu. Hub: [`docs/06-component-usage-guide.md`](../06-component-usage-guide.md).
> Dùng cho **mọi danh sách quản lý có phân trang**. Bảng nhỏ không phân trang (top-5) → primitive `Table`.

Diện mạo admin (header sticky nền `bg-muted`, nhãn **chữ thường** xanh lam `text-secondary-foreground`,
cell `px-6 py-3`, row hover `bg-field`) là **default** — chỉ cần `<DataGrid>`, không truyền
`tableLayout`/`tableClassNames` để dựng lại. Đổi look chung = sửa `data-grid-table.tsx` / token.

---

## 1. Khung chuẩn

```tsx
import { useMemo, useState } from 'react';
import { type PaginationState, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardFooter, CardTable } from '@/components/ui/card';

const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
const columns = useEmployeeColumns();   // xem mục 2

const table = useReactTable({
  columns,
  data,
  pageCount: Math.ceil(total / pagination.pageSize),
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

return (
  <DataGrid table={table} recordCount={total}>
    <Card>
      <CardTable>
        <ScrollArea>
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardTable>
      <CardFooter className="justify-between">
        <DataGridPagination />   {/* default tiếng Việt — xem mục 3 */}
      </CardFooter>
    </Card>
  </DataGrid>
);
```

---

## 2. Column factory — `createColumnHelpers<TRow>()`

Thay vì viết `ColumnDef` thủ công, dùng factory thuần (gói trong **một** `useMemo`) để có cột typed,
nhất quán, tự nối `lib/date` + `lib/format`. Import từ `@/components/ui/data-grid-columns`.

```tsx
import { useMemo } from 'react';
import { createColumnHelpers, type StatusBadgeConfig } from '@/components/ui/data-grid-columns';

const statusConfig: StatusBadgeConfig<EmployeeStatus> = {
  active: { label: 'Hoạt động', className: 'bg-admin-success-bg text-admin-success-text', dotClassName: 'bg-admin-success-dot' },
  locked: { label: 'Đã khóa', variant: 'outline', dotClassName: 'bg-admin-neutral-400' },
};

export function useEmployeeColumns() {
  return useMemo(() => {
    const col = createColumnHelpers<Employee>();
    return [
      col.index(),
      col.text({ id: 'name', header: 'Họ tên', get: (r) => r.name, tooltipOnTruncate: true }),
      col.currency({ id: 'salary', header: 'Lương', get: (r) => r.salary }),
      col.date({ id: 'createdAt', header: 'Ngày tạo', get: (r) => r.createdAt, mode: 'relative' }),
      col.badge({ id: 'status', header: 'Trạng thái', get: (r) => r.status, config: statusConfig }),
      col.actions({ header: 'Thao tác', cell: (r) => <RowActions row={r} /> }),
    ];
  }, []);
}
```

Builder (đều trả `ColumnDef<TRow>`, accessor `get: (row) => value`):

| Builder | Dùng cho |
|---|---|
| `text({ get, tooltipOnTruncate? })` | chuỗi, truncate + tooltip tùy chọn |
| `number({ get, options? })` | số, căn phải, qua `formatNumber` |
| `currency({ get })` | tiền VND qua `formatCurrencyVND` |
| `percent({ get, fractionDigits? })` | % (input là tỉ lệ, `0.125` → `12,5%`) |
| `date({ get, mode? })` | `'date' \| 'datetime' \| 'relative'` qua `lib/date` |
| `badge({ get, config })` | `StatusBadge` theo `StatusBadgeConfig` |
| `index()` | số thứ tự 1-based (theo trang) |
| `select()` | checkbox chọn dòng |
| `actions({ cell })` | cột thao tác (cell căn phải) |
| `custom({ cell })` | cell tùy biến (escape hatch) |

Tham số chung: `id`, `header`, `headerClassName`, `cellClassName`, `visibility`, `enableSorting`, `size`.

---

## 3. DataGridPagination

Default **tiếng Việt sẵn** → thường chỉ cần `<DataGridPagination />` (xem hub §0.2):
`sizesLabel=''`, `sizesDescription='dòng'`, `info='{count} kết quả'`. `info` hỗ trợ placeholder
`{from} {to} {count}`. Chỉ truyền prop khi **thật sự khác** mặc định (vd `info="{from}-{to} trên {count}"`).

---

## 4. Persist ẩn/hiện cột — `usePersistedColumnVisibility`

Lưu trạng thái ẩn/hiện cột vào `localStorage` qua adapter an toàn (`src/lib/storage.ts`).

```tsx
import { usePersistedColumnVisibility } from '@/components/ui/data-grid-columns';

const { columnVisibility, onColumnVisibilityChange } =
  usePersistedColumnVisibility('examples.employees.columnVisibility');

const table = useReactTable({
  /* ... */,
  state: { pagination, columnVisibility },
  onColumnVisibilityChange,
});
```

---

## Ghi chú

- Width/căn lề cột đặt qua `meta.headerClassName` / `meta.cellClassName`, **không** style trực tiếp `<th>/<td>`.
- Empty/loading của bảng có default tiếng Việt (`Không có dữ liệu` / `Đang tải...`) — không cần truyền.
- Tham chiếu sống: `src/examples/employees/` (DataGrid + column factory + persist + React Query mock).
