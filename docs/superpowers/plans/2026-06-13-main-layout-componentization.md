# Main Layout Componentization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `MainLayoutPage` so it keeps the current visual design from `docs/04-specific-design-system.md` while using the shared UI component layer, especially Metronic's `DataGrid`, instead of raw HTML controls.

**Architecture:** Treat the current `main-layout` visual style as the new foundation for this template. Restyle the root/default variants of shared UI components where appropriate, because Metronic examples are secondary references, not the target style. Convert the employee list from raw table markup to the Metronic `DataGrid` pattern used in `C:\Users\PC\Desktop\metronic-v9.4.13\metronic-tailwind-react-demos\typescript\vite\src\pages\dashboards\demo1\light-sidebar\components\teams.tsx`: `useReactTable` + `DataGrid` + `Card` + `CardTable` + `ScrollArea` + `DataGridTable` + `DataGridPagination`.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4 `@theme`, class-variance-authority, TanStack React Table, existing Metronic/shadcn-style UI primitives.

---

## Current Problem

`src/pages/main-layout/page.tsx` is visually correct, but it bypasses the shared component layer:

- Card shell is a raw `section`.
- Toolbar search is a raw `label` + `input`.
- Icon and primary actions are raw `button`.
- Employee avatar is a raw `div`.
- Role/status badges are raw `span`.
- Employee list is a raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`.
- Pagination footer is raw buttons and text.

This makes the page a good one-off mockup but a weak template foundation. The desired output is the same visual screen implemented through reusable components, with paginated data lists using `DataGrid` by default.

---

## Updated Decisions

- Use `DataGrid` for `MainLayoutPage` because it is a paginated management list.
- Reserve primitive `Table` for small non-paginated tables, for example a dashboard "Top 5" list.
- It is allowed to change default/root variants of shared UI components to match the current style.
- Do not protect Metronic example styling at the cost of the template style. Metronic examples are useful for layout/reference only.
- Keep visual output of `/` unchanged even though implementation changes substantially.

---

## Visual Regression Contract

After implementation, `/` using `MainLayoutPage` must still look the same:

- Outer page padding: `p-6`.
- Data card: 12px radius, `border-admin-neutral-100`, white surface, subtle two-layer shadow.
- Toolbar: 20px padding, title `18px`, description `13px`, actions aligned right on wide desktop.
- Search input: 36px height, 256px width, search icon at left, `admin-surface-alt` background, green focus ring.
- Icon buttons: 36px square, white background, admin border, subtle shadow, hover `admin-surface-alt`.
- Primary action: 36px height, green `#2f8f3f`, hover `#267a2b`, icon + label.
- DataGrid table: sticky header, header background `admin-page`, uppercase 12px header labels, rows 49px-ish, hover `admin-surface-alt`.
- Employee cell: 36px avatar, gradient variants, 14px semibold name, 12px muted username.
- Badges: same size, colors, radius, and dot behavior as current page.
- Pagination footer: fixed card footer, page-size control left, result count, prev/current/next controls right.

No component refactor is complete until browser screenshots at 1366px and 1920px confirm this contract.

---

## DataGrid Reference Pattern

Follow the Metronic demo pattern from:

`C:\Users\PC\Desktop\metronic-v9.4.13\metronic-tailwind-react-demos\typescript\vite\src\pages\dashboards\demo1\light-sidebar\components\teams.tsx`

Relevant structure:

```tsx
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
const [sorting, setSorting] = useState<SortingState>([]);
const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
const [searchQuery, setSearchQuery] = useState('');

const filteredData = useMemo(() => {
  if (!searchQuery) return employees;
  return employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );
}, [searchQuery]);

const columns = useMemo<ColumnDef<Employee>[]>(() => [...], []);

const table = useReactTable({
  columns,
  data: filteredData,
  pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  getRowId: (row) => row.username,
  state: { pagination, sorting, rowSelection },
  columnResizeMode: 'onChange',
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
  <DataGrid table={table} recordCount={filteredData.length}>
    <Card>
      <CardHeader>...</CardHeader>
      <CardTable>
        <ScrollArea>
          <DataGridTable />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardTable>
      <CardFooter>
        <DataGridPagination />
      </CardFooter>
    </Card>
  </DataGrid>
);
```

---

## Component Audit

| Current raw UI in `MainLayoutPage` | Component to use | Required styling work |
|---|---|---|
| Data card `section` | `Card`, `CardHeader`, `CardHeading`, `CardTitle`, `CardDescription`, `CardToolbar`, `CardTable`, `CardFooter` | Restyle default card slots to match current admin card where appropriate. |
| Search `input` | `InputWrapper`, `Input` | Restyle default input wrapper/input toward current admin search field. |
| Toolbar icon buttons | `Button` | Restyle default `outline`/`icon` behavior toward current 36px admin controls. |
| Primary CTA button | `Button` | Restyle default `primary` toward current green admin CTA. |
| Row action button | `Button` | Add or restyle a soft/action variant for permission actions. |
| Role/status badges | `Badge`, `BadgeDot` | Restyle badge defaults and add semantic role/status variants. |
| Avatar initials | `Avatar`, `AvatarFallback` | Use avatar primitives with gradient fallback classes. |
| Raw employee table | `DataGrid`, `DataGridTable`, `DataGridPagination`, TanStack columns | Build proper `ColumnDef<Employee>[]`, pagination state, search state, and row action cells. |
| Small non-paginated tables elsewhere | `Table` primitive | Leave available for dashboard top lists or detail subtables. Do not use it for this employee list. |

---

## Files To Modify

- Modify: `src/components/ui/button.tsx`
  - Update root/default variants to align with current admin visual style.
  - It is acceptable if Metronic example buttons visually change; this template style wins.
  - Keep API names stable (`primary`, `outline`, `secondary`, `ghost`, `mode="icon"`).

- Modify: `src/components/ui/input.tsx`
  - Align default `Input`, `InputWrapper`, and focus ring with current admin inputs.
  - Preserve size props (`sm`, `md`, `lg`) but tune `md` to current 36px control rhythm where feasible.

- Modify: `src/components/ui/badge.tsx`
  - Align default badge typography/radius with current page.
  - Add semantic variants for employee role and active status if useful.

- Modify: `src/components/ui/card.tsx`
  - Align default card, header, content/table, footer with current admin card.
  - Keep `variant="accent"` if existing examples need it, but default card should match the template.

- Modify: `src/components/ui/data-grid.tsx`
  - Make default `tableLayout` closer to admin management tables.
  - Keep options flexible for future examples.

- Modify: `src/components/ui/data-grid-table.tsx`
  - Restyle default DataGrid header, body rows, sticky header, dense spacing, selected/hover row states, pinned cell backgrounds.
  - Ensure `tableClassNames` can still override page-specific needs.

- Modify: `src/components/ui/data-grid-pagination.tsx`
  - Restyle pagination to match current footer: page size left, result count, prev/current/next controls right.
  - Vietnamese labels should be supported through props from the page.

- Modify: `src/pages/main-layout/page.tsx`
  - Convert the employee list to TanStack `useReactTable`.
  - Replace raw elements with shared components.
  - Keep employee mock data and visual content unchanged.

- Optional create: `src/pages/main-layout/components/employee-cell.tsx`
  - Extract only if `page.tsx` becomes too large.
  - Use `Avatar`, `AvatarFallback`, and text slots.

- Optional create: `src/pages/main-layout/components/employee-badges.tsx`
  - Extract only if role/status mapping becomes noisy.
  - Use `Badge` and `BadgeDot`.

---

## Task 1: Baseline Snapshot And DataGrid Map

**Files:**
- Read: `src/pages/main-layout/page.tsx`
- Read: `src/components/ui/data-grid.tsx`
- Read: `src/components/ui/data-grid-table.tsx`
- Read: `src/components/ui/data-grid-pagination.tsx`
- Read: `src/components/ui/card.tsx`
- Read: `src/components/ui/button.tsx`
- Read: `src/components/ui/input.tsx`
- Read: `src/components/ui/badge.tsx`
- Read: `C:\Users\PC\Desktop\metronic-v9.4.13\metronic-tailwind-react-demos\typescript\vite\src\pages\dashboards\demo1\light-sidebar\components\teams.tsx`

- [ ] Start the dev server with `npm run dev -- --host 127.0.0.1`.
- [ ] Open `/` at 1366px and capture a screenshot before changes.
- [ ] Open `/` at 1920px and capture a screenshot before changes.
- [ ] Map current raw columns to DataGrid columns:
  - `employee`: name, username, initials/avatar.
  - `roles`: role badges.
  - `status`: active badge.
  - `actions`: permission action or dash.
- [ ] Confirm `Table` primitive is not used for `MainLayoutPage`.

Expected decision: employee list uses `DataGrid`; primitive `Table` is reserved for small non-paginated lists in future pages.

---

## Task 2: Restyle Shared Component Defaults To Admin Style

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/badge.tsx`

- [ ] Update `Button` default/root classes so primary, outline, secondary, ghost, and icon modes align with current admin controls.

Recommended default direction:

```tsx
primary: 'bg-[#2f8f3f] text-white hover:bg-[#267a2b] data-[state=open]:bg-[#267a2b]',
outline:
  'border border-admin-neutral-100 bg-white text-admin-neutral-600 hover:bg-admin-surface-alt data-[state=open]:bg-admin-surface-alt',
secondary:
  'border border-admin-blue-border bg-admin-blue-bg text-admin-blue-primary hover:bg-[#e8f3fb] data-[state=open]:bg-[#e8f3fb]',
ghost:
  'text-admin-neutral-600 hover:bg-admin-surface-alt hover:text-admin-neutral-800 data-[state=open]:bg-admin-surface-alt',
```

- [ ] Tune `Button` sizes so `md` can render current 36px toolbar buttons and `mode="icon"` can render exact 36px square via defaults or minimal className.
- [ ] Update `Input`/`InputWrapper` defaults to admin border, background, font size, and green focus ring.
- [ ] Update `Card` default slot classes toward current admin card:
  - card radius `rounded-admin-card`;
  - border `border-admin-neutral-100`;
  - background `bg-admin-surface`;
  - subtle shadow matching current page.
- [ ] Update `Badge` default base to keep current compact density and add semantic variants:

```tsx
adminRoleEmployee:
  'border-admin-blue-light bg-admin-blue-bg text-admin-blue-dark',
adminRoleOwner:
  'border-admin-red-light bg-admin-red-bg text-admin-red-dark',
adminRoleManager:
  'border-[#ddd6ff] bg-admin-violet-bg text-admin-violet-dark',
adminStatusActive:
  'border-transparent bg-admin-success-bg text-admin-success-text',
```

- [ ] Run `npm run build`.

Expected result: shared components compile and their defaults now represent the target template style.

---

## Task 3: Restyle DataGrid Defaults

**Files:**
- Modify: `src/components/ui/data-grid.tsx`
- Modify: `src/components/ui/data-grid-table.tsx`
- Modify: `src/components/ui/data-grid-pagination.tsx`

- [ ] Set `DataGrid` default table layout for admin management pages:

```tsx
tableLayout: {
  dense: false,
  cellBorder: false,
  rowBorder: true,
  rowRounded: false,
  stripped: false,
  headerSticky: true,
  headerBackground: true,
  headerBorder: true,
  width: 'fixed',
  columnsVisibility: false,
  columnsResizable: false,
  columnsPinnable: false,
  columnsMovable: false,
  columnsDraggable: false,
  rowsDraggable: false,
}
```

- [ ] Update `tableClassNames.headerSticky` default to current visual:

```tsx
'sticky top-0 z-10 bg-admin-page'
```

- [ ] Update DataGrid header row/cell defaults:
  - header row background `bg-admin-page`;
  - header text `text-admin-blue-dark`;
  - font `text-[12px] font-semibold uppercase tracking-[0.06em]`;
  - spacing equivalent to `px-6 py-3`.
- [ ] Update body row/cell defaults:
  - row hover `hover:bg-admin-surface-alt`;
  - borders `border-admin-neutral-100`;
  - cell spacing equivalent to `px-6 py-3.5`;
  - text `text-admin-neutral-800`.
- [ ] Update pinned cell backgrounds from generic `bg-background/90` to admin surface backgrounds.
- [ ] Update `DataGridPagination` default labels or page-level props to support:
  - `10 dòng`;
  - `9 kết quả`;
  - Vietnamese screen reader labels where visible text is absent.
- [ ] Run `npm run build`.

Expected result: DataGrid is styled as the canonical admin table system.

---

## Task 4: Convert MainLayoutPage To TanStack DataGrid

**Files:**
- Modify: `src/pages/main-layout/page.tsx`

- [ ] Add required imports:

```tsx
import { useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
```

- [ ] Add table state:

```tsx
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
});
const [sorting, setSorting] = useState<SortingState>([]);
const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
const [searchQuery, setSearchQuery] = useState('');
```

- [ ] Add filtered employee data:

```tsx
const filteredEmployees = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return employees;

  return employees.filter((employee) =>
    employee.name.toLowerCase().includes(query) ||
    employee.username.toLowerCase().includes(query) ||
    employee.roles.some((role) => role.toLowerCase().includes(query)),
  );
}, [searchQuery]);
```

- [ ] Define `ColumnDef<Employee>[]` for:
  - employee entity cell;
  - roles;
  - status;
  - actions.
- [ ] Use `meta.headerClassName` and `meta.cellClassName` for current width/alignment requirements.
- [ ] Create the table instance:

```tsx
const table = useReactTable({
  columns,
  data: filteredEmployees,
  pageCount: Math.ceil(filteredEmployees.length / pagination.pageSize),
  getRowId: (row) => row.username,
  state: {
    pagination,
    sorting,
    rowSelection,
  },
  columnResizeMode: 'onChange',
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
  enableRowSelection: true,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
```

- [ ] Render `DataGrid` around the card:

```tsx
<DataGrid
  table={table}
  recordCount={filteredEmployees.length}
  tableClassNames={{
    base: 'min-w-[860px]',
    header: 'sticky top-0 z-10 bg-admin-page',
    bodyRow: 'group',
  }}
>
  <Card className="min-h-0 flex-1 overflow-hidden">
    ...
  </Card>
</DataGrid>
```

Expected result: `MainLayoutPage` uses real DataGrid state and pagination while keeping the current visible content.

---

## Task 5: Convert Card, Toolbar, Search, And Actions

**Files:**
- Modify: `src/pages/main-layout/page.tsx`

- [ ] Replace raw outer `section` with `Card`.
- [ ] Replace raw toolbar block with `CardHeader`, `CardHeading`, `CardTitle`, `CardDescription`, and `CardToolbar`.
- [ ] Replace raw search label/input with `InputWrapper` and `Input`.
- [ ] Bind search input to `searchQuery`.
- [ ] Replace filter and refresh raw buttons with `Button variant="outline" mode="icon"`.
- [ ] Replace primary action raw button with `Button variant="primary"`.
- [ ] Replace row permission raw button with `Button variant="secondary" size="sm"`.
- [ ] Preserve row action reveal behavior with `group-hover:opacity-100` through `tableClassNames.bodyRow = 'group'` and the action button class.

Expected result: all interactive controls in the page use shared components and remain visually identical.

---

## Task 6: Convert Employee Cell, Badges, And Status To Shared Components

**Files:**
- Modify: `src/pages/main-layout/page.tsx`
- Optional create: `src/pages/main-layout/components/employee-cell.tsx`
- Optional create: `src/pages/main-layout/components/employee-badges.tsx`

- [ ] Replace avatar raw `div` with `Avatar` and `AvatarFallback`.
- [ ] Keep the current gradient avatar color map unless another page needs it later.
- [ ] Rewrite `RoleBadge` to return `Badge`.
- [ ] Rewrite `StatusBadge` to return `Badge` and `BadgeDot`.
- [ ] Keep current role/status colors exactly.

Target status:

```tsx
<Badge variant="adminStatusActive" className="gap-1.5">
  <BadgeDot className="bg-admin-success-dot opacity-100" />
  Hoạt động
</Badge>
```

Expected result: entity cells and badges use the shared component layer.

---

## Task 7: Render DataGridTable And DataGridPagination

**Files:**
- Modify: `src/pages/main-layout/page.tsx`
- Modify as needed: `src/components/ui/data-grid-pagination.tsx`

- [ ] Replace raw table block with:

```tsx
<CardTable className="min-h-0 flex-1 overflow-auto">
  <ScrollArea className="h-full">
    <DataGridTable />
    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</CardTable>
```

- [ ] Replace raw pagination footer with:

```tsx
<CardFooter className="shrink-0 justify-between border-admin-neutral-100 bg-white p-4 text-[13px] text-admin-neutral-600">
  <DataGridPagination
    sizes={[10, 25, 50]}
    sizesLabel=""
    sizesDescription="dòng"
    info="{count} kết quả"
    className="py-0"
  />
</CardFooter>
```

- [ ] If `DataGridPagination` cannot reproduce the current footer layout through props alone, restyle the component defaults rather than reintroducing raw pagination markup in the page.
- [ ] Keep the current active page button visual: `bg-admin-neutral-600 text-white`.

Expected result: pagination is driven by TanStack table state and visually matches the existing page.

---

## Task 8: Raw Element Cleanup

**Files:**
- Modify: `src/pages/main-layout/page.tsx`

- [ ] Confirm there are no raw controls left for reusable UI concerns.
- [ ] This command should not show raw button/input/table markup in `MainLayoutPage`:

```powershell
rg -n "<button|<input|<table|<thead|<tbody|<tr|<td|<th" src/pages/main-layout/page.tsx
```

- [ ] Raw layout elements like `div`, `span`, and text wrappers are allowed when they are not base UI components.
- [ ] Ensure primitive `Table` is not imported in `MainLayoutPage`.

Expected result: `MainLayoutPage` is a composition of shared UI components plus domain renderers.

---

## Task 9: Verification

**Files:**
- Verify: `src/pages/main-layout/page.tsx`
- Verify: changed files in `src/components/ui`

- [ ] Run TypeScript and production build:

```powershell
npm run build
```

Expected: `tsc && vite build` exits with code `0`.

- [ ] Run DataGrid usage check:

```powershell
rg -n "DataGrid|DataGridTable|DataGridPagination|useReactTable" src/pages/main-layout/page.tsx
```

Expected: all four are present.

- [ ] Run raw table/control search:

```powershell
rg -n "<button|<input|<table|<thead|<tbody|<tr|<td|<th" src/pages/main-layout/page.tsx
```

Expected: no matches.

- [ ] Start dev server and inspect `/` at 1366px.
- [ ] Inspect `/` at 1920px.
- [ ] Compare against baseline screenshots from Task 1.
- [ ] Verify search filters employees.
- [ ] Verify page-size control and pagination buttons work.
- [ ] Fix any visual drift before marking complete.

---

## Out Of Scope For This Pass

- Do not create all pages under `src/pages/example` yet.
- Do not add API fetching.
- Do not add server-side pagination.
- Do not redesign the visual language beyond matching the current page.
- Do not remove primitive `Table`; keep it for small non-paginated dashboard/detail tables.
- Do not change `docs/04-specific-design-system.md`; this task uses it as visual reference only.

---

## Completion Checklist

- [ ] `MainLayoutPage` visual design remains unchanged.
- [ ] Employee list uses `DataGrid`, `DataGridTable`, and `DataGridPagination`.
- [ ] Shared UI component defaults are aligned with the current template style.
- [ ] Raw card/search/button/table/badge/avatar implementations are replaced by shared UI primitives.
- [ ] Primitive `Table` remains available for non-paginated small tables.
- [ ] Build passes.
- [ ] Browser QA passes at 1366px and 1920px.
