# Coding Convention & Project Structure

## Vite + React + TypeScript + Tailwind CSS

> Tài liệu quy định cấu trúc, đặt tên, và pattern coding cho toàn bộ dự án.  
> Mục tiêu: nhất quán, dễ đọc, dễ tìm kiếm, dễ maintain.

> ⚠️ **Về stack/version:** file này mô tả _ý tưởng convention_ (đa số vẫn đúng), nhưng phần
> **stack cụ thể và số phiên bản** (đặc biệt §9 Routing, §10 Tailwind, §16 Tooling/Libraries) đã
> được cập nhật trong **`docs/00-stack-and-architecture.md`** — coi `docs/00` + `package.json` là
> nguồn đúng. Khác biệt chính: dự án dùng **React 19, React Router 7 (declarative), Tailwind 4
> (`@theme`, không có `tailwind.config.ts`)**, và Prettier **`semi: true`**.

---

## Mục lục

1. [Cấu trúc thư mục](#1-cấu-trúc-thư-mục)
2. [Naming Conventions](#2-naming-conventions)
3. [TypeScript](#3-typescript)
4. [React Components](#4-react-components)
5. [Custom Hooks](#5-custom-hooks)
6. [State Management](#6-state-management)
7. [API & Data Fetching](#7-api--data-fetching)
8. [Form Handling](#8-form-handling)
9. [Routing](#9-routing)
10. [Tailwind CSS](#10-tailwind-css)
11. [Cấu trúc một Feature](#11-cấu-trúc-một-feature)
12. [Imports & Exports](#12-imports--exports)
13. [Error Handling](#13-error-handling)
14. [Performance](#14-performance)
15. [Git Convention](#15-git-convention)
16. [Tooling & Config](#16-tooling--config)

---

## 1. Cấu trúc thư mục

```
src/
├── app/                        # App-level setup
│   ├── App.tsx
│   ├── router.tsx              # Route definitions
│   ├── providers.tsx           # Wrap toàn bộ providers
│   └── store.ts                # Zustand store root (nếu dùng)
│
├── assets/                     # Static assets
│   ├── fonts/
│   ├── images/
│   └── icons/                  # SVG icons custom
│
├── components/                 # Shared / reusable components
│   ├── ui/                     # Base UI components (Button, Input, Table...)
│   │   ├── button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── select/
│   │   ├── table/
│   │   ├── modal/
│   │   ├── pagination/
│   │   ├── tag/
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── AppLayout.tsx       # Shell chính: sidebar + main
│   │   ├── PageHeader.tsx      # Tiêu đề trang + breadcrumb
│   │   ├── Sidebar.tsx
│   │   ├── SidebarMenu.tsx
│   │   └── ...
│   └── common/                 # Component dùng chung nhiều feature
│       ├── ConfirmDialog.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       ├── StatusTag.tsx
│       └── ...
│
├── features/                   # Feature modules (tách theo domain)
│   ├── auth/
│   ├── products/
│   ├── orders/
│   ├── customers/
│   └── ...
│
├── hooks/                      # Global custom hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── usePermission.ts
│   └── ...
│
├── lib/                        # Utilities, helpers, configs
│   ├── axios.ts                # Axios instance + interceptors
│   ├── queryClient.ts          # React Query client setup
│   ├── utils.ts                # General utils (cn, formatDate...)
│   ├── format.ts               # Format tiền tệ, số, ngày VN
│   └── validators.ts           # Zod schemas dùng chung
│
├── styles/                     # Global styles
│   ├── globals.css             # Tailwind base + custom CSS
│   ├── theme.css               # CSS variables (design tokens)
│   └── overrides/              # Override Metronic components
│       ├── table.css
│       ├── form.css
│       └── ...
│
├── types/                      # Global TypeScript types
│   ├── api.types.ts            # Response/Request types chung
│   ├── common.types.ts         # Shared types (Pagination, Status...)
│   └── env.d.ts                # Vite env type declarations
│
└── constants/                  # App-level constants
    ├── routes.ts               # Route path constants
    ├── queryKeys.ts            # React Query key factory
    └── config.ts               # App config (PAGE_SIZE, DATE_FORMAT...)
```

### 1.1 Cấu trúc Feature module

Mỗi feature là một module khép kín, chứa tất cả những gì liên quan:

```
features/products/
├── components/                 # Components riêng của feature
│   ├── ProductTable.tsx
│   ├── ProductForm.tsx
│   ├── ProductFilter.tsx
│   └── ProductStatusTag.tsx
│
├── hooks/                      # Hooks riêng
│   ├── useProductList.ts       # Query + filter state
│   ├── useProductForm.ts       # Form state + submit
│   └── useProductColumns.ts    # Column definitions cho table
│
├── pages/                      # Route pages
│   ├── ProductListPage.tsx
│   └── ProductDetailPage.tsx
│
├── api/                        # API calls của feature
│   ├── product.api.ts
│   └── product.queries.ts      # React Query definitions
│
├── types/                      # Types riêng của feature
│   └── product.types.ts
│
├── schemas/                    # Zod validation schemas
│   └── product.schema.ts
│
├── constants/                  # Constants riêng
│   └── product.constants.ts
│
└── index.ts                    # Public API của feature
```

### 1.2 Nguyên tắc tổ chức

- **Feature-first, không layer-first.** Đặt code gần nhau theo domain, không theo loại file.
- **Không tạo barrel file quá sâu.** `index.ts` chỉ export những gì cần expose ra ngoài feature.
- **`components/ui/`** là nơi duy nhất chứa base components — không tạo component button/input tương tự ở feature level.
- **`components/common/`** là nơi chứa component dùng chung nhưng có logic nghiệp vụ nhẹ (StatusTag, ConfirmDialog).
- Một file không nên dài hơn **400 dòng** — nếu vượt, tách ra.

---

## 2. Naming Conventions

### 2.1 Files & Folders

| Loại             | Convention                   | Ví dụ                            |
| ---------------- | ---------------------------- | -------------------------------- |
| React Component  | `PascalCase.tsx`             | `ProductTable.tsx`               |
| Custom Hook      | `camelCase.ts`, prefix `use` | `useProductList.ts`              |
| Utility / Helper | `camelCase.ts`               | `format.ts`, `validators.ts`     |
| Type file        | `camelCase.types.ts`         | `product.types.ts`               |
| Schema file      | `camelCase.schema.ts`        | `product.schema.ts`              |
| API file         | `camelCase.api.ts`           | `product.api.ts`                 |
| Constants file   | `camelCase.constants.ts`     | `product.constants.ts`           |
| Query file       | `camelCase.queries.ts`       | `product.queries.ts`             |
| Page component   | `PascalCase + Page.tsx`      | `ProductListPage.tsx`            |
| Layout component | `PascalCase + Layout.tsx`    | `AppLayout.tsx`                  |
| Folder           | `kebab-case`                 | `product-form/`, `order-detail/` |

### 2.2 Variables & Functions

```typescript
// ✅ camelCase cho variable và function
const productList = [];
const isLoading = false;
function fetchProducts() {}
const handleSubmit = () => {};

// ✅ PascalCase cho class và type/interface
class ProductService {}
type ProductStatus = 'active' | 'inactive';
interface ProductFormValues {}

// ✅ SCREAMING_SNAKE_CASE cho constants không thay đổi
const MAX_PAGE_SIZE = 100;
const API_BASE_URL = '/api/v1';
const DATE_FORMAT_VN = 'dd/MM/yyyy';

// ✅ Prefix rõ ràng cho boolean
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldRefetch = false;

// ✅ Prefix cho handlers
const handleSubmit = () => {};
const handleDeleteRow = () => {};
const handleFilterChange = () => {};
const handlePageChange = () => {};

// ✅ Prefix cho async functions
async function fetchProductById(id: string) {}
async function createProduct(data: CreateProductDto) {}
async function updateProduct(id: string, data: UpdateProductDto) {}
async function deleteProduct(id: string) {}
```

### 2.3 React Components

```typescript
// ✅ PascalCase, đặt tên theo chức năng, không theo vị trí
// ❌ sai: LeftPanel, TopSection, MainContainer
// ✅ đúng: ProductFilter, OrderSummary, CustomerContactForm

// ✅ Props interface: [ComponentName]Props
interface ProductTableProps {
  data: Product[];
  loading: boolean;
  onEdit: (id: string) => void;
}

// ✅ Component đặt tên khớp với tên file
// File: ProductTable.tsx → export default function ProductTable
```

### 2.4 TypeScript Types & Interfaces

```typescript
// Interface cho object shape (có thể extend)
interface Product {
  id: string;
  name: string;
  price: number;
}

// Type cho union, intersection, hoặc alias đơn giản
type ProductStatus = 'active' | 'inactive' | 'discontinued';
type ProductId = string;

// DTO: suffix Dto
interface CreateProductDto {
  name: string;
  price: number;
  categoryId: string;
}
interface UpdateProductDto extends Partial<CreateProductDto> {}

// Response wrapper
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 3. TypeScript

### 3.1 Quy tắc chung

```typescript
// ✅ Luôn khai báo kiểu cho function parameters và return type
function formatPrice(amount: number, currency = 'VND'): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency
}

// ✅ Không dùng `any` — dùng `unknown` nếu chưa biết type
// ❌ sai
function processData(data: any) {}

// ✅ đúng
function processData(data: unknown) {
  if (typeof data === 'string') { ... }
}

// ✅ Dùng `as const` cho object/array cố định
const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const
type OrderStatus = typeof ORDER_STATUSES[number]

// ✅ Non-null assertion (!.) chỉ khi CHẮC CHẮN không null
// Hạn chế dùng, prefer optional chaining (?.)
const name = user?.profile?.name ?? 'Chưa cập nhật'

// ✅ Generics đặt tên có nghĩa, không phải chỉ T
function useQuery<TData, TError = Error>(key: string): QueryResult<TData, TError>
// T, U, V... chỉ dùng khi context đủ rõ
```

### 3.2 Enums vs Union Types

```typescript
// ✅ Dùng Union Type (không dùng enum - tree-shakeable hơn)
type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'
type PaymentMethod = 'cash' | 'bank_transfer' | 'momo' | 'vnpay'

// ❌ Tránh enum (nếu không có lý do đặc biệt)
enum OrderStatus { Pending = 'pending', ... }

// ✅ Nếu cần label tiếng Việt, dùng Map hoặc object const
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
}
```

### 3.3 Utility Types thường dùng

```typescript
// Partial — tất cả field optional (dùng cho update form)
type UpdateProductDto = Partial<Product>;

// Pick — chỉ lấy một số field
type ProductPreview = Pick<Product, 'id' | 'name' | 'price'>;

// Omit — bỏ một số field
type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

// Required — tất cả field required
type ProductWithDetails = Required<Product>;

// Record — map key → value
type StatusConfig = Record<OrderStatus, { label: string; color: string }>;
```

---

## 4. React Components

### 4.1 Cấu trúc component chuẩn

```typescript
// ProductTable.tsx

import { useState } from 'react'
import type { FC } from 'react'

// Types
interface ProductTableProps {
  data: Product[]
  loading?: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

// Component
const ProductTable: FC<ProductTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
}) => {
  // 1. State
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // 2. Derived state / computed
  const hasSelected = selectedIds.length > 0

  // 3. Handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((p) => p.id) : [])
  }

  const handleDelete = (id: string) => {
    // Confirm trước khi xóa → xem ConfirmDialog
    onDelete(id)
  }

  // 4. Effects (sau handlers)

  // 5. Early returns (loading, empty)
  if (loading) return <TableSkeleton rows={5} />

  // 6. Render
  return (
    <div className="table-section">
      {hasSelected && <BulkActionBar count={selectedIds.length} />}
      <table>
        {/* ... */}
      </table>
    </div>
  )
}

export default ProductTable
```

### 4.2 Quy tắc component

```typescript
// ✅ Một file = một component chính (default export)
// Có thể có sub-component nhỏ trong cùng file nếu chỉ dùng nội bộ

// ✅ Props destructuring ngay tại parameter
const Button = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}) => {};

// ✅ Default props tại parameter, không dùng defaultProps
// ❌ sai
Button.defaultProps = { disabled: false };

// ✅ Children prop — khai báo rõ kiểu
interface CardProps {
  children: React.ReactNode;
  title?: string;
}

// ✅ Event handler props đặt tên: on + Event (onSubmit, onChange, onDelete)
// ✅ Callback từ component lên parent: đặt rõ tham số
interface TableProps {
  onRowClick: (id: string) => void; // ✅ rõ ràng
  onSelectionChange: (ids: string[]) => void; // ✅ rõ ràng
  // ❌ sai: onClick: () => void — không biết click gì
}

// ✅ Tách component khi:
// - JSX > 100 dòng
// - Logic phức tạp lặp lại
// - Có thể reuse ở nơi khác
```

### 4.3 Conditional Rendering

```typescript
// ✅ Dùng && cho render điều kiện đơn giản
{isLoading && <Spinner />}

// ✅ Dùng ternary cho if/else ngắn
{hasData ? <ProductTable data={data} /> : <EmptyState />}

// ✅ Tách ra biến cho điều kiện phức tạp
const content = (() => {
  if (isLoading) return <Skeleton />
  if (error) return <ErrorState message={error.message} />
  if (!data?.length) return <EmptyState />
  return <ProductTable data={data} />
})()

return <div className="content-area">{content}</div>

// ❌ Tránh nested ternary khó đọc
{a ? b ? <X /> : <Y /> : <Z />}
```

### 4.4 Memo & Performance

```typescript
// ✅ memo cho component nhận nhiều props, render thường xuyên
const ProductRow = memo<ProductRowProps>(({ product, onEdit }) => {
  return <tr>...</tr>
})

// ✅ useCallback cho handlers truyền xuống component con
const handleEdit = useCallback((id: string) => {
  navigate(`/products/${id}/edit`)
}, [navigate])

// ✅ useMemo cho computed values nặng
const sortedProducts = useMemo(
  () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
  [products]
)

// ❌ Không memo bừa bãi — chỉ khi có vấn đề thực sự về performance
// memo/useCallback/useMemo đều có overhead — đừng wrap tất cả
```

---

## 5. Custom Hooks

### 5.1 Cấu trúc hook chuẩn

```typescript
// hooks/useProductList.ts

interface UseProductListOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UseProductListReturn {
  // Data
  products: Product[];
  total: number;
  // State
  isLoading: boolean;
  error: Error | null;
  // Filter & Pagination
  filters: ProductFilters;
  pagination: PaginationState;
  // Actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export function useProductList(
  options: UseProductListOptions = {},
): UseProductListReturn {
  const { initialPage = 1, initialPageSize = 20 } = options;

  const [filters, setFiltersState] = useState<ProductFilters>({});
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: productQueryKeys.list({ ...filters, ...pagination }),
    queryFn: () => productApi.getList({ ...filters, ...pagination }),
  });

  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset về trang 1
  }, []);

  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    setPage: (page) => setPagination((p) => ({ ...p, page })),
    setPageSize: (pageSize) => setPagination({ page: 1, pageSize }),
    refetch,
  };
}
```

### 5.2 Quy tắc hooks

```typescript
// ✅ Hook luôn return object (không phải array) nếu > 2 giá trị
// ❌ sai: return [data, loading, error, setFilter]
// ✅ đúng: return { data, isLoading, error, setFilter }

// ✅ Hook trả về isLoading, bukan loading
// Convention nhất quán với React Query và các lib phổ biến

// ✅ Đặt tên hook mô tả rõ chức năng
useProductList(); // query list
useProductForm(); // form state + submit
useProductColumns(); // table column definitions
usePermission(); // check quyền
useLocalStorage(); // persisted state

// ✅ Không gọi API trực tiếp trong component — luôn qua hook
// ❌ sai (trong component):
const { data } = useQuery({ queryFn: () => fetch('/api/products') });

// ✅ đúng:
const { products } = useProductList();
```

---

## 6. State Management

### 6.1 Phân cấp state

```
Local State (useState)
  └─ UI state: modal open, selected rows, form toggle
  └─ Component-only data không cần share

Server State (React Query / TanStack Query)
  └─ Tất cả dữ liệu từ API
  └─ Cache, background refetch, invalidation

Global Client State (Zustand)
  └─ Auth: user info, permissions, token
  └─ App settings: sidebar collapsed, theme
  └─ Cross-feature state thực sự cần global
```

### 6.2 Zustand Store

```typescript
// app/store.ts — khai báo store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tách store theo domain, không tạo một store khổng lồ
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'auth-storage' },
  ),
);

export const useAppStore = create<AppState>()((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

// ✅ Mỗi store trong file riêng ở features/[name]/store/
// ✅ Tên: use[Domain]Store
// ✅ Không put server state vào Zustand — đó là việc của React Query
```

### 6.3 React Query Keys

```typescript
// constants/queryKeys.ts — factory pattern

export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (params: ProductListParams) =>
    [...productQueryKeys.lists(), params] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

// Sử dụng
useQuery({ queryKey: productQueryKeys.list({ page: 1, pageSize: 20 }) });
queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
```

---

## 7. API & Data Fetching

### 7.1 Axios Instance

```typescript
// lib/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: normalize error
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message ?? 'Đã có lỗi xảy ra';
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(new Error(message));
  },
);

export default api;
```

### 7.2 API Module

```typescript
// features/products/api/product.api.ts

import type { ApiResponse, PaginatedResponse } from '@/types/api.types';
import api from '@/lib/axios';
import type {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '../types/product.types';

const BASE = '/products';

export const productApi = {
  getList: (params: ProductListParams) =>
    api.get<PaginatedResponse<Product>>(BASE, { params }),

  getById: (id: string) => api.get<ApiResponse<Product>>(`${BASE}/${id}`),

  create: (data: CreateProductDto) =>
    api.post<ApiResponse<Product>>(BASE, data),

  update: (id: string, data: UpdateProductDto) =>
    api.put<ApiResponse<Product>>(`${BASE}/${id}`, data),

  delete: (id: string) => api.delete<ApiResponse<void>>(`${BASE}/${id}`),

  deleteMany: (ids: string[]) =>
    api.delete<ApiResponse<void>>(BASE, { data: { ids } }),
};
```

### 7.3 React Query Definitions

```typescript
// features/products/api/product.queries.ts

import { productQueryKeys } from '@/constants/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toast';
import { productApi } from './product.api';

export function useProductListQuery(params: ProductListParams) {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productApi.getList(params),
    staleTime: 1000 * 60 * 5, // 5 phút
  });
}

export function useProductDetailQuery(id: string) {
  return useQuery({
    queryKey: productQueryKeys.detail(id),
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success('Thêm sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productQueryKeys.lists() });
      toast.success('Xóa sản phẩm thành công');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
```

---

## 8. Form Handling

Dùng **React Hook Form** + **Zod** cho tất cả form.

### 8.1 Schema validation

```typescript
// features/products/schemas/product.schema.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên sản phẩm không được để trống')
    .max(255, 'Tên sản phẩm tối đa 255 ký tự'),
  sku: z
    .string()
    .min(1, 'Mã SKU không được để trống')
    .regex(/^[A-Z0-9-]+$/, 'Mã SKU chỉ gồm chữ hoa, số và dấu gạch ngang'),
  price: z
    .number({ invalid_type_error: 'Giá phải là số' })
    .min(0, 'Giá không được âm')
    .max(1_000_000_000, 'Giá vượt quá giới hạn'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Infer TypeScript type từ schema
export type CreateProductFormValues = z.infer<typeof createProductSchema>;
export type UpdateProductFormValues = z.infer<typeof updateProductSchema>;
```

### 8.2 Form Hook

```typescript
// features/products/hooks/useProductForm.ts

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  createProductSchema,
  type CreateProductFormValues,
} from '../schemas/product.schema';

interface UseProductFormOptions {
  defaultValues?: Partial<CreateProductFormValues>;
  onSuccess?: () => void;
}

export function useProductForm({
  defaultValues,
  onSuccess,
}: UseProductFormOptions = {}) {
  const { mutate: createProduct, isPending } = useCreateProductMutation();

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      categoryId: '',
      ...defaultValues,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    createProduct(values, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  });

  return { form, onSubmit, isSubmitting: isPending };
}
```

### 8.3 Form Component

```typescript
// features/products/components/ProductForm.tsx

import { useProductForm } from '../hooks/useProductForm'

const ProductForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { form, onSubmit, isSubmitting } = useProductForm({ onSuccess })
  const { register, formState: { errors } } = form

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="form-row">
        <FormField label="Tên sản phẩm" required error={errors.name?.message}>
          <Input {...register('name')} placeholder="Nhập tên sản phẩm" />
        </FormField>

        <FormField label="Mã SKU" required error={errors.sku?.message}>
          <Input {...register('sku')} placeholder="VD: SP-001" />
        </FormField>
      </div>

      <div className="form-actions">
        <Button variant="ghost" type="button" onClick={() => form.reset()}>
          Hủy
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Lưu sản phẩm
        </Button>
      </div>
    </form>
  )
}
```

---

## 9. Routing

> Thực tế dự án dùng **React Router 7** với cú pháp **declarative `<Routes>/<Route>`** trong
> `src/routing/app-routing-setup.tsx` (không dùng `createBrowserRouter` như ví dụ dưới). Path khai
> báo tập trung ở `src/constants/routes.ts`. Ví dụ `createBrowserRouter` dưới đây giữ lại để tham
> khảo pattern lazy-load + route constants, không phải cấu trúc hiện tại.

### 9.1 Khai báo Routes

```typescript
// app/router.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { ROUTES } from '@/constants/routes'

// Lazy load page components
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'))

const PageLoader = () => <div className="page-loader" />

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.PRODUCTS.LIST} replace /> },
      {
        path: ROUTES.PRODUCTS.LIST,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProductListPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PRODUCTS.DETAIL,
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProductDetailPage />
          </Suspense>
        ),
      },
    ],
  },
])
```

### 9.2 Route Constants

```typescript
// constants/routes.ts
// Định nghĩa tập trung, không hardcode string path trong component

export const ROUTES = {
  HOME: '/',
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products/create',
    DETAIL: '/products/:id',
    EDIT: '/products/:id/edit',
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: '/orders/:id',
  },
} as const;

// Helper để build path có params
export function buildPath(path: string, params: Record<string, string>) {
  return Object.entries(params).reduce(
    (p, [key, val]) => p.replace(`:${key}`, val),
    path,
  );
}

// Sử dụng
navigate(buildPath(ROUTES.PRODUCTS.DETAIL, { id: product.id }));
```

---

## 10. Tailwind CSS

### 10.1 Utility function `cn`

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Dùng cn() cho tất cả className — merge Tailwind classes đúng cách
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sử dụng
<div className={cn(
  'flex items-center gap-2',
  isActive && 'bg-primary-light text-primary',
  disabled && 'opacity-50 cursor-not-allowed'
)} />
```

### 10.2 CSS Variables cho Design Tokens

> ⚠️ Dự án dùng **Tailwind 4**, **không có `tailwind.config.ts`**. Design token khai báo trực tiếp
> trong `src/styles/globals.css`: biến `--admin-*` rồi map qua `@theme inline` thành class
> (`bg-admin-surface`, `text-admin-blue-dark`, `rounded-admin-card`...). Palette template là
> **xanh lá** (`--admin-primary: #009966`), không phải `#1677FF`. Đoạn `:root`/`tailwind.config.ts`
> dưới đây là minh họa khái niệm token — chỉnh token thật ở `globals.css`.

```css
/* styles/theme.css */
:root {
  /* Colors từ Design System */
  --color-primary: #1677ff;
  --color-primary-hover: #0958d9;
  --color-primary-light: #e6f4ff;
  --color-primary-border: #91caff;

  --color-success: #52c41a;
  --color-success-light: #f6ffed;
  --color-warning: #fa8c16;
  --color-warning-light: #fff7e6;
  --color-danger: #ff4d4f;
  --color-danger-light: #fff2f0;

  --color-text-primary: #141414;
  --color-text-secondary: #595959;
  --color-text-disabled: #bfbfbf;
  --color-border: #d9d9d9;
  --color-border-light: #f0f0f0;
  --color-bg-page: #f5f5f5;
  --color-bg-card: #ffffff;
  --color-bg-table-header: #fafafa;

  /* Spacing */
  --sidebar-width: 240px;
  --sidebar-collapsed: 64px;
  --page-header-height: 48px;
  --toolbar-height: 52px;
  --pagination-height: 48px;
  --table-row-height: 40px;
  --input-height: 32px;
  --button-height: 32px;
}
```

```javascript
// tailwind.config.ts — extend với design tokens
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          border: 'var(--color-primary-border)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light: 'var(--color-danger-light)',
        },
        border: 'var(--color-border)',
        'border-light': 'var(--color-border-light)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
      },
      height: {
        'page-header': 'var(--page-header-height)',
        toolbar: 'var(--toolbar-height)',
        pagination: 'var(--pagination-height)',
        row: 'var(--table-row-height)',
        input: 'var(--input-height)',
        btn: 'var(--button-height)',
      },
      width: {
        sidebar: 'var(--sidebar-width)',
      },
      fontSize: {
        xs: ['11px', '16px'],
        sm: ['12px', '18px'],
        base: ['13px', '20px'],
        md: ['14px', '22px'],
        title: ['16px', '24px'],
      },
    },
  },
};
```

### 10.3 Quy tắc Tailwind

```typescript
// ✅ Dùng cn() để merge classes có điều kiện
// ❌ sai: className={`btn ${isActive ? 'btn-active' : ''}`}
// ✅ đúng: className={cn('btn', isActive && 'btn-active')}

// ✅ Extract class strings dài thành biến
const tableHeaderClass = cn(
  'sticky top-0 z-10',
  'bg-[var(--color-bg-table-header)]',
  'border-b-2 border-border',
  'text-sm font-semibold text-text-secondary',
  'whitespace-nowrap',
);

// ✅ Dùng design token class thay vì hardcode màu
// ❌ sai: className="bg-[#1677FF] text-[#141414]"
// ✅ đúng: className="bg-primary text-text-primary"

// ✅ Responsive chỉ khi cần (admin app ít dùng)
// min-width 1280px — không cần sm:, md: cho phần lớn component

// ❌ Không viết CSS phức tạp trong className — tách ra CSS module hoặc file CSS
// ❌ sai: className="[&>thead>tr>th]:bg-slate-100 [&_tbody_tr:hover]:bg-blue-50"
```

### 10.4 Component Class Pattern

```typescript
// Tổ chức variant classes với object map — dễ maintain
const buttonVariants = {
  primary:   'bg-primary text-white border-primary hover:bg-primary-hover',
  secondary: 'bg-white text-text-primary border-border hover:border-primary hover:text-primary',
  danger:    'bg-danger text-white border-danger hover:bg-red-600',
  ghost:     'bg-transparent text-text-secondary border-border hover:bg-[#F5F5F5]',
} as const

const buttonSizes = {
  sm:   'h-6 px-3 text-xs',
  md:   'h-btn px-4 text-base',
  lg:   'h-10 px-5 text-md',
} as const

interface ButtonProps {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
}

const Button = ({ variant = 'primary', size = 'md', ...props }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center gap-1.5',
      'border rounded font-normal',
      'transition-colors duration-150',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      buttonVariants[variant],
      buttonSizes[size],
    )}
    {...props}
  />
)
```

---

## 11. Cấu trúc một Feature

Ví dụ đầy đủ với feature **Products**:

### 11.1 Thứ tự xây dựng

```
1. types/product.types.ts          — Định nghĩa interface
2. schemas/product.schema.ts       — Validation rules
3. api/product.api.ts              — API functions
4. api/product.queries.ts          — React Query hooks
5. hooks/useProductList.ts         — Feature hook (filter + pagination)
6. hooks/useProductForm.ts         — Form hook
7. hooks/useProductColumns.ts      — Table column definitions
8. components/ProductTable.tsx     — Table UI
9. components/ProductForm.tsx      — Form UI
10. components/ProductFilter.tsx   — Filter/search toolbar
11. pages/ProductListPage.tsx      — Assembles everything
12. pages/ProductDetailPage.tsx
13. index.ts                       — Export public API
```

### 11.2 Page component — Pattern chuẩn

```typescript
// features/products/pages/ProductListPage.tsx

const ProductListPage = () => {
  // 1. State và logic qua hook
  const {
    products,
    total,
    isLoading,
    filters,
    pagination,
    setFilters,
    setPage,
    setPageSize,
  } = useProductList()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { mutate: deleteProduct } = useDeleteProductMutation()
  const navigate = useNavigate()

  // 2. Handlers
  const handleEdit = useCallback((id: string) => {
    navigate(buildPath(ROUTES.PRODUCTS.EDIT, { id }))
  }, [navigate])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteProduct(deleteTarget, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  // 3. JSX — thuần layout/render, không có logic
  return (
    <>
      <PageHeader
        title="Danh sách sản phẩm"
        breadcrumb={['Kho hàng', 'Sản phẩm']}
        actions={
          <Button onClick={() => navigate(ROUTES.PRODUCTS.CREATE)}>
            + Thêm mới
          </Button>
        }
      />

      <div className="content-area">
        <ProductFilter filters={filters} onChange={setFilters} />

        {selectedIds.length > 0 && (
          <BulkActionBar
            count={selectedIds.length}
            onDelete={() => { /* bulk delete */ }}
          />
        )}

        <div className="table-section">
          <div className="table-wrapper">
            <ProductTable
              data={products}
              loading={isLoading}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteTarget(id)}
            />
          </div>

          <PaginationBar
            total={total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xác nhận xóa"
        description="Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}

export default ProductListPage
```

---

## 12. Imports & Exports

### 12.1 Path Aliases

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 12.2 Quy tắc Import

```typescript
// Thứ tự import — cách nhau bằng 1 dòng trống:
// 1. Node modules
import { useCallback, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
// 2. Internal — absolute paths (@/)
import { Button } from '@/components/ui/button';
import { ProductTable } from '../components/ProductTable';
// 3. Feature-local — relative paths
import { useProductList } from '../hooks/useProductList';
import type { Product } from '../types/product.types';

// ✅ Luôn dùng absolute path (@/) cho import cross-feature
// ✅ Dùng relative path (./) cho import trong cùng feature
// ✅ Import type riêng biệt: import type { ... }
```

### 12.3 Export Pattern

```typescript
// ✅ Default export cho React components (1 file = 1 component)
export default ProductTable;

// ✅ Named export cho utilities, hooks, types, constants
export function useProductList() {}
export const productApi = {};
export type { Product, CreateProductDto };

// ✅ Barrel file (index.ts) tại feature root — chỉ export public API
// features/products/index.ts
export { default as ProductListPage } from './pages/ProductListPage';
export { default as ProductDetailPage } from './pages/ProductDetailPage';
// Không export internal components, hooks, api

// ❌ Không re-export tất cả từ thư mục con
// export * from './components' // — tránh, dễ bị circular dependency
```

---

## 13. Error Handling

### 13.1 Error Boundary

```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
    // Gửi lên error tracking (Sentry, v.v.)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <ErrorState message="Đã có lỗi xảy ra" />
    }
    return this.props.children
  }
}

// Wrap mỗi page với ErrorBoundary
<ErrorBoundary>
  <ProductListPage />
</ErrorBoundary>
```

### 13.2 Async Error Handling

```typescript
// ✅ Không try/catch trong component — để React Query handle
// ✅ onError trong mutation → toast thông báo
// ✅ error state từ useQuery → render ErrorState component

// ✅ Pattern cho error từ API
interface ApiError {
  message: string;
  errors?: Record<string, string[]>; // Field-level errors từ server
}

// Trong mutation onError:
onError: (error: ApiError) => {
  if (error.errors) {
    // Set field errors vào RHF
    Object.entries(error.errors).forEach(([field, messages]) => {
      form.setError(field as keyof FormValues, {
        message: messages[0],
      });
    });
  } else {
    toast.error(error.message);
  }
};
```

---

## 14. Performance

### 14.1 Code Splitting

```typescript
// ✅ Lazy load tất cả page-level components
const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'))

// ✅ Lazy load modal/dialog nặng
const ImportExcelModal = lazy(() => import('../components/ImportExcelModal'))
const {open: showImport, close: hideImport} = useModal()

{showImport && (
  <Suspense fallback={<ModalLoader />}>
    <ImportExcelModal onClose={hideImport} />
  </Suspense>
)}
```

### 14.2 Table Performance

```typescript
// ✅ Virtualization cho bảng > 100 dòng — dùng @tanstack/react-virtual
import { useVirtualizer } from '@tanstack/react-virtual';

// ✅ Stable column definitions — khai báo ngoài component
// ❌ sai: const columns = [...] // bên trong component → recreate mỗi render
// ✅ đúng: hooks/useProductColumns.ts → useMemo

// ✅ Không render lại toàn bảng khi chỉ thay đổi 1 cell
// Dùng memo cho TableRow, truyền stable callbacks qua useCallback
```

### 14.3 Debounce & Throttle

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Sử dụng trong search
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  setFilters({ keyword: debouncedSearch });
}, [debouncedSearch]);
```

---

## 15. Git Convention

### 15.1 Branch Naming

```
main            — Production
develop         — Integration branch
staging         — Pre-production (nếu có)

feature/[ticket-id]-[short-description]
  feature/PRD-123-product-list-page
  feature/ORD-45-bulk-delete-orders

fix/[ticket-id]-[short-description]
  fix/PRD-456-table-scroll-broken

chore/[description]
  chore/upgrade-react-query-v5
  chore/update-design-tokens

hotfix/[description]
  hotfix/pagination-wrong-total
```

### 15.2 Commit Message

Theo **Conventional Commits**:

```
<type>(<scope>): <subject>

type:
  feat     — tính năng mới
  fix      — sửa bug
  style    — thay đổi CSS/UI không ảnh hưởng logic
  refactor — refactor code
  chore    — config, dependency, tooling
  docs     — tài liệu
  test     — tests
  perf     — cải thiện performance

scope: tên feature (products, orders, auth, layout...)
subject: tiếng Anh hoặc tiếng Việt, câu thường (không viết hoa đầu, không dấu chấm)

Ví dụ:
  feat(products): add bulk delete with confirmation dialog
  fix(table): fix sticky column not working on Safari
  style(button): update primary button hover color per design system
  refactor(orders): extract useOrderForm hook from OrderDetailPage
  chore: upgrade @tanstack/react-query to v5
  docs: add coding convention document
```

### 15.3 Pull Request

```markdown
## Mô tả

[Mô tả ngắn những gì PR này làm]

## Ticket

[Link Jira / ticket]

## Loại thay đổi

- [ ] Bug fix
- [ ] Feature mới
- [ ] Refactor
- [ ] Config / chore

## Checklist

- [ ] Code không có lỗi TypeScript
- [ ] Không có `console.log` debug
- [ ] Đã test trên Chrome
- [ ] Đã test responsive 1366px
- [ ] Không break feature khác
```

---

## 16. Tooling & Config

### 16.1 ESLint

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',

    // React
    'react/react-in-jsx-scope': 'off', // Vite không cần import React
    'react/prop-types': 'off', // Dùng TypeScript thay
    'react-hooks/exhaustive-deps': 'warn',

    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

### 16.2 Prettier

`.prettierrc` **thực tế** (theo file trong repo — để `npm run format` quyết định, đừng sửa tay theo trí nhớ):

```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "endOfLine": "lf",
  "singleQuote": true,
  "trailingComma": "all",
  "bracketSpacing": true,
  "semi": true,
  "bracketSameLine": false,
  "jsxSingleQuote": false,
  "arrowParens": "always",
  "plugins": [
    "prettier-plugin-tailwindcss",
    "@ianvs/prettier-plugin-sort-imports"
  ]
}
```

> Lưu ý: **`semi: true`** (có dấu chấm phẩy), `printWidth: 80`, `trailingComma: all`, và import được
> tự sắp xếp bởi `@ianvs/prettier-plugin-sort-imports` (`importOrder` trong `.prettierrc`).

### 16.3 tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 16.4 Thư viện chính

> ⚠️ **Số phiên bản dưới đây đã cũ.** Phiên bản đúng luôn lấy từ `package.json`. Bảng này chỉ liệt
> kê các lib _vai trò cốt lõi_ đã chốt cho template (chi tiết: `docs/00-stack-and-architecture.md`).

| Vai trò      | Thư viện                                                | Thực tế                      |
| ------------ | ------------------------------------------------------- | ---------------------------- |
| UI           | `react`, `react-dom`                                    | **19**                       |
| Routing      | `react-router` / `react-router-dom`                     | **7** (declarative)          |
| Server state | `@tanstack/react-query`                                 | **5**                        |
| Global state | `zustand`                                               | đã cài                       |
| HTTP         | `axios`                                                 | đã cài                       |
| Form         | `react-hook-form`, `@hookform/resolvers`, `zod`         | đã cài                       |
| i18n         | `react-intl`                                            | đã cài                       |
| Class utils  | `clsx`, `tailwind-merge` (qua `cn()`)                   | đã cài                       |
| Icon         | `lucide-react`                                          | đã cài                       |
| Build/CSS    | `vite` **7**, `tailwindcss` **4** (`@tailwindcss/vite`) | không có `tailwind.config.*` |
| Test         | `vitest`, `@testing-library/react`                      | jsdom                        |
| Chất lượng   | `eslint`, `prettier`, `husky`, `lint-staged`            | pre-commit                   |

### 16.5 Environment Variables

```bash
# .env.example — commit vào repo
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Admin System
VITE_APP_VERSION=1.0.0

# .env.local — KHÔNG commit
VITE_API_URL=https://api.yourdomain.com/api/v1
```

```typescript
// types/env.d.ts — typed env vars
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## Checklist Review Code

Trước khi tạo PR, review lại:

**Structure**

- [ ] File đặt đúng thư mục (feature module, không đặt lung tung)
- [ ] Tên file/folder theo convention
- [ ] Không có code "chết" (unused imports, unused variables)

**TypeScript**

- [ ] Không có `any`
- [ ] Props có interface định nghĩa rõ ràng
- [ ] Không dùng non-null assertion (`!`) bừa bãi

**React**

- [ ] Không fetch data trực tiếp trong component (dùng hook)
- [ ] Handler đặt tên đúng `handle*`
- [ ] Không có logic phức tạp trong JSX

**State**

- [ ] Server state dùng React Query
- [ ] Global client state dùng Zustand
- [ ] Không lưu server data vào Zustand

**Form**

- [ ] Dùng React Hook Form + Zod
- [ ] Error message tiếng Việt, rõ nghĩa
- [ ] Có loading state khi submit

**CSS/Tailwind**

- [ ] Dùng design token (`text-primary`, `bg-primary`) thay vì hardcode màu
- [ ] Dùng `cn()` cho conditional classes
- [ ] Không viết `style={{}}` inline (ngoại lệ: dynamic values thực sự)

**Git**

- [ ] Commit message đúng conventional commits
- [ ] Không có `console.log` (trừ `console.error`, `console.warn`)
- [ ] Không commit file `.env`
