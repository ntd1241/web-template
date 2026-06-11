# Thiết kế Module Phân hệ & Phân quyền (RBAC + Scope)

> Tài liệu mô tả kiến trúc toàn bộ hệ thống phân quyền: từ data model, BE logic, FE implementation, đến Admin UI quản lý.

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Data Model](#2-data-model)
3. [Permission Naming Convention](#3-permission-naming-convention)
4. [Scope System](#4-scope-system)
5. [Backend Design](#5-backend-design)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Route Protection](#7-route-protection)
8. [Component-level Permission](#8-component-level-permission)
9. [Sidebar & Navigation Adaptation](#9-sidebar--navigation-adaptation)
10. [Auth Flow & Token](#10-auth-flow--token)
11. [Admin UI — Quản lý Phân hệ](#11-admin-ui--quản-lý-phân-hệ)
12. [Ví dụ end-to-end](#12-ví-dụ-end-to-end)

---

## 1. Tổng quan hệ thống

### 1.1 Khái niệm

| Khái niệm | Định nghĩa |
|---|---|
| **Phân hệ** (Role) | Một tập hợp quyền + scope gắn với một loại người dùng. VD: "Trưởng phòng kho", "Kế toán", "Admin" |
| **Quyền** (Permission) | Khả năng thực hiện 1 action cụ thể trên 1 resource. VD: `products:create` |
| **Nhóm quyền** (PermissionGroup) | Gom các permission liên quan để hiển thị trên UI. VD: "Quản lý sản phẩm" |
| **Phạm vi** (Scope) | Giới hạn dữ liệu được phép truy cập. Hardcode 3 mức: `self`, `department`, `all` |
| **Người dùng** có thể thuộc **nhiều phân hệ** | Quyền là union của tất cả phân hệ; scope lấy mức cao nhất |

### 1.2 Luồng hoạt động

```
User login
    │
    ▼
BE trả về JWT (payload gồm userId, roles, permissions[], scope)
    │
    ▼
FE lưu vào AuthStore
    │
    ├──► Router Guards    — check permission trước khi render page
    ├──► Sidebar          — lọc menu theo permission
    ├──► Components       — ẩn/disable button theo permission
    └──► API Calls        — BE kiểm tra lại permission + scope
```

### 1.3 Nguyên tắc thiết kế

- **FE check để UX tốt** — ẩn/disable element không có quyền
- **BE check để bảo mật** — mọi API đều validate lại, không tin FE
- **Permission là flat list** — không phân cấp cha-con phức tạp
- **Scope là additive** — user nhiều phân hệ → lấy scope rộng nhất
- **Không hardcode permission string** trong component — dùng constants

---

## 2. Data Model

### 2.1 Database Schema

```
┌─────────────────────┐       ┌──────────────────────────┐
│       roles         │       │       permissions        │
├─────────────────────┤       ├──────────────────────────┤
│ id          UUID PK │       │ id          UUID PK      │
│ code        VARCHAR │       │ code        VARCHAR UK   │  ← 'products:create'
│ name        VARCHAR │       │ name        VARCHAR      │  ← 'Thêm sản phẩm'
│ description TEXT    │       │ group_code  VARCHAR      │  ← 'products'
│ scope       ENUM    │       │ description TEXT         │
│ is_active   BOOL    │       │ sort_order  INT          │
│ created_at  TS      │       └──────────────────────────┘
│ updated_at  TS      │
└─────────────────────┘
         │
         │  M:N
         ▼
┌──────────────────────┐      ┌──────────────────────────┐
│   role_permissions   │      │    permission_groups     │
├──────────────────────┤      ├──────────────────────────┤
│ role_id   UUID FK    │      │ code        VARCHAR PK   │  ← 'products'
│ perm_id   UUID FK    │      │ name        VARCHAR      │  ← 'Quản lý sản phẩm'
│ PRIMARY KEY(role,perm)│      │ icon        VARCHAR      │
└──────────────────────┘      │ sort_order  INT          │
                               └──────────────────────────┘

┌─────────────────────┐
│     user_roles      │
├─────────────────────┤
│ user_id   UUID FK   │
│ role_id   UUID FK   │
│ PRIMARY KEY(u,r)    │
└─────────────────────┘
```

### 2.2 TypeScript Types (shared — dùng cả FE và BE types generation)

```typescript
// types/permission.types.ts

// ─── Scope ─────────────────────────────────────────────────────────────────

export const SCOPES = ['self', 'department', 'all'] as const
export type Scope = typeof SCOPES[number]

// Thứ tự ưu tiên — dùng khi tính scope hiệu quả của user nhiều phân hệ
export const SCOPE_PRIORITY: Record<Scope, number> = {
  self: 1,
  department: 2,
  all: 3,
}

export const SCOPE_LABELS: Record<Scope, string> = {
  self: 'Cá nhân',
  department: 'Phòng ban',
  all: 'Tất cả',
}

// ─── Permission ─────────────────────────────────────────────────────────────

export interface Permission {
  id: string
  code: string           // 'products:create'
  name: string           // 'Thêm sản phẩm'
  groupCode: string      // 'products'
  description?: string
  sortOrder: number
}

export interface PermissionGroup {
  code: string           // 'products'
  name: string           // 'Quản lý sản phẩm'
  icon?: string
  sortOrder: number
  permissions: Permission[]
}

// ─── Role (Phân hệ) ─────────────────────────────────────────────────────────

export interface Role {
  id: string
  code: string           // 'warehouse_manager'
  name: string           // 'Trưởng kho'
  description?: string
  scope: Scope
  isActive: boolean
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export interface CreateRoleDto {
  code: string
  name: string
  description?: string
  scope: Scope
  permissionCodes: string[]
}

export type UpdateRoleDto = Partial<CreateRoleDto>

// ─── Auth context ────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  username: string
  fullName: string
  email: string
  departmentId: string
  departmentName: string
  roles: Pick<Role, 'id' | 'code' | 'name' | 'scope'>[]
  // Đã flatten — FE không cần join lại
  permissions: string[]   // ['products:view', 'products:create', ...]
  effectiveScope: Scope   // scope cao nhất trong tất cả phân hệ
}
```

---

## 3. Permission Naming Convention

### 3.1 Cấu trúc

```
[module]:[resource]:[action]
   │          │        │
   │          │        └── view | create | edit | delete | export | import | approve | reject
   │          └─────────── resource trong module (optional — bỏ nếu module = resource)
   └────────────────────── tên module/feature
```

**Ví dụ đầy đủ:**

```typescript
// constants/permissions.ts
// ĐÂY LÀ FILE DUY NHẤT ĐỊNH NGHĨA PERMISSION STRINGS

export const PERMISSIONS = {

  // ── Sản phẩm ──────────────────────────────────────────────────────────────
  PRODUCTS: {
    VIEW:    'products:view',
    CREATE:  'products:create',
    EDIT:    'products:edit',
    DELETE:  'products:delete',
    EXPORT:  'products:export',
    IMPORT:  'products:import',
  },

  // ── Đơn hàng ──────────────────────────────────────────────────────────────
  ORDERS: {
    VIEW:    'orders:view',
    CREATE:  'orders:create',
    EDIT:    'orders:edit',
    DELETE:  'orders:delete',
    APPROVE: 'orders:approve',
    CANCEL:  'orders:cancel',
    EXPORT:  'orders:export',
  },

  // ── Kho hàng ──────────────────────────────────────────────────────────────
  WAREHOUSE: {
    VIEW:    'warehouse:view',
    IMPORT_VOUCHER: {       // resource con: phiếu nhập
      VIEW:   'warehouse:import_voucher:view',
      CREATE: 'warehouse:import_voucher:create',
      EDIT:   'warehouse:import_voucher:edit',
      APPROVE:'warehouse:import_voucher:approve',
    },
    EXPORT_VOUCHER: {       // resource con: phiếu xuất
      VIEW:   'warehouse:export_voucher:view',
      CREATE: 'warehouse:export_voucher:create',
      APPROVE:'warehouse:export_voucher:approve',
    },
  },

  // ── Nhân sự ───────────────────────────────────────────────────────────────
  HR: {
    VIEW:    'hr:view',
    EMPLOYEE: {
      VIEW:   'hr:employee:view',
      CREATE: 'hr:employee:create',
      EDIT:   'hr:employee:edit',
      DELETE: 'hr:employee:delete',
    },
    REQUEST: {              // phiếu yêu cầu
      VIEW:   'hr:request:view',
      CREATE: 'hr:request:create',
      APPROVE:'hr:request:approve',
    },
  },

  // ── Báo cáo ───────────────────────────────────────────────────────────────
  REPORTS: {
    VIEW:      'reports:view',
    REVENUE:   'reports:revenue',
    INVENTORY: 'reports:inventory',
    EXPORT:    'reports:export',
  },

  // ── Hệ thống (Admin only) ─────────────────────────────────────────────────
  SYSTEM: {
    ROLE: {
      VIEW:   'system:role:view',
      CREATE: 'system:role:create',
      EDIT:   'system:role:edit',
      DELETE: 'system:role:delete',
    },
    USER: {
      VIEW:   'system:user:view',
      CREATE: 'system:user:create',
      EDIT:   'system:user:edit',
      DELETE: 'system:user:delete',
    },
    SETTINGS: {
      VIEW:   'system:settings:view',
      EDIT:   'system:settings:edit',
    },
  },

} as const

// Utility type để extract tất cả permission strings
type DeepValues<T> = T extends string
  ? T
  : T extends object
    ? DeepValues<T[keyof T]>
    : never

export type PermissionCode = DeepValues<typeof PERMISSIONS>
```

### 3.2 Quy tắc đặt tên

```
✅ Dùng snake_case cho resource nhiều từ:  import_voucher, export_voucher
✅ Dùng : làm separator (dễ parse)
✅ Action luôn là từ cuối cùng
✅ Nhất quán action names: view/create/edit/delete/approve/reject/export/import/cancel
❌ Không dùng: read, write, update, remove, add — dễ nhầm
❌ Không viết hoa: PRODUCTS:VIEW — khó match string
```

---

## 4. Scope System

### 4.1 Định nghĩa 3 mức scope

```
self         → Chỉ dữ liệu của chính user
department   → Dữ liệu của toàn bộ phòng ban user thuộc về
all          → Tất cả dữ liệu, không giới hạn
```

### 4.2 Scope hiệu quả (Effective Scope)

Khi user có nhiều phân hệ → scope hiệu quả = scope rộng nhất:

```typescript
// lib/permission.utils.ts

export function resolveEffectiveScope(scopes: Scope[]): Scope {
  if (!scopes.length) return 'self'
  return scopes.reduce((best, current) =>
    SCOPE_PRIORITY[current] > SCOPE_PRIORITY[best] ? current : best
  )
}

// Ví dụ:
// User có phân hệ "Nhân viên" (self) + "Trưởng phòng" (department)
// → effectiveScope = 'department'
```

### 4.3 BE áp dụng scope vào query

```typescript
// BE: service layer — áp dụng scope filter

interface ScopedQueryOptions {
  userId: string
  departmentId: string
  scope: Scope
}

// Ví dụ: lấy danh sách phiếu yêu cầu HR
async function getHrRequests(options: ScopedQueryOptions) {
  const { userId, departmentId, scope } = options

  const where =
    scope === 'self'       ? { createdById: userId }       :
    scope === 'department' ? { department: { id: departmentId } } :
    {}  // scope === 'all' → không filter

  return prisma.hrRequest.findMany({ where })
}
```

### 4.4 FE hiểu scope

```typescript
// FE sử dụng scope để điều chỉnh UI — không phải bảo mật (BE lo)

// Ví dụ: filter mặc định của trang theo scope
function useHrRequestList() {
  const { user } = useAuth()

  // Gợi ý filter mặc định cho người dùng
  const defaultFilter = useMemo(() => {
    if (user.effectiveScope === 'self') {
      return { createdById: user.id }  // Pre-fill filter "của tôi"
    }
    if (user.effectiveScope === 'department') {
      return { departmentId: user.departmentId }
    }
    return {}  // all — không pre-filter
  }, [user])

  // BE sẽ enforce scope thực sự — FE chỉ hint
  return useQuery({
    queryKey: hrRequestQueryKeys.list(defaultFilter),
    queryFn: () => hrRequestApi.getList(defaultFilter),
  })
}
```

---

## 5. Backend Design

### 5.1 JWT Payload

```typescript
// JWT payload — nhúng sẵn permission để FE không cần gọi API riêng
interface JwtPayload {
  sub: string           // userId
  username: string
  fullName: string
  departmentId: string
  roles: string[]       // ['warehouse_manager', 'inventory_viewer']
  permissions: string[] // ['products:view', 'warehouse:import_voucher:view', ...]
  effectiveScope: Scope // 'department'
  iat: number
  exp: number
}
```

> **Lưu ý:** Nhúng permissions vào JWT → FE decode ngay, không cần gọi `/me`.  
> Trade-off: token lớn hơn. Giải pháp: chỉ nhúng `permissions[]` (string array), không nhúng object đầy đủ.  
> Khi admin cập nhật quyền → force logout user bị ảnh hưởng (invalidate token qua Redis blacklist hoặc rotation).

### 5.2 BE Permission Guard (NestJS example)

```typescript
// guards/permission.guard.ts

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required?.length) return true

    const { user } = context.switchToHttp().getRequest()

    const hasAll = required.every((perm) => user.permissions.includes(perm))
    if (!hasAll) throw new ForbiddenException('Không có quyền thực hiện thao tác này')

    return true
  }
}

// Custom decorator
export const RequirePermissions = (...permissions: PermissionCode[]) =>
  SetMetadata('permissions', permissions)

// Sử dụng trong controller
@Get('/products')
@RequirePermissions(PERMISSIONS.PRODUCTS.VIEW)
async getProducts(@CurrentUser() user: AuthUser) {
  return this.productService.getList({ scope: user.effectiveScope, ... })
}

@Post('/products')
@RequirePermissions(PERMISSIONS.PRODUCTS.CREATE)
async createProduct(@Body() dto: CreateProductDto) { ... }
```

### 5.3 Scope Guard riêng

```typescript
// guards/scope.guard.ts
// Kiểm tra scope khi truy cập resource của entity khác

@Injectable()
export class ScopeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user: AuthUser = request.user
    const resourceOwnerId: string = request.params.userId || request.body.userId

    if (!resourceOwnerId) return true  // Không cần check scope

    if (user.effectiveScope === 'all') return true

    if (user.effectiveScope === 'department') {
      const sameDepart = await this.userService.inSameDepartment(
        user.id,
        resourceOwnerId
      )
      if (!sameDepart) throw new ForbiddenException('Không trong phạm vi phòng ban')
      return true
    }

    // scope === 'self'
    if (user.id !== resourceOwnerId) {
      throw new ForbiddenException('Chỉ được xem dữ liệu của bản thân')
    }
    return true
  }
}
```

---

## 6. Frontend Architecture

### 6.1 Auth Store (Zustand)

```typescript
// features/auth/store/auth.store.ts

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  // Actions
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
  // Permission helpers — computed inline, không persist
  hasPermission: (code: PermissionCode | PermissionCode[]) => boolean
  hasAnyPermission: (codes: PermissionCode[]) => boolean
  hasAllPermissions: (codes: PermissionCode[]) => boolean
  hasScope: (required: Scope) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        queryClient.clear()  // Xóa cache React Query
      },

      // ── Permission helpers ─────────────────────────────────────────────────

      hasPermission: (code) => {
        const { user } = get()
        if (!user) return false
        const codes = Array.isArray(code) ? code : [code]
        // Mặc định: phải có TẤT CẢ quyền được truyền vào
        return codes.every((c) => user.permissions.includes(c))
      },

      hasAnyPermission: (codes) => {
        const { user } = get()
        if (!user) return false
        return codes.some((c) => user.permissions.includes(c))
      },

      hasAllPermissions: (codes) => {
        const { user } = get()
        if (!user) return false
        return codes.every((c) => user.permissions.includes(c))
      },

      hasScope: (required) => {
        const { user } = get()
        if (!user) return false
        return SCOPE_PRIORITY[user.effectiveScope] >= SCOPE_PRIORITY[required]
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
```

### 6.2 usePermission Hook

```typescript
// hooks/usePermission.ts

interface UsePermissionReturn {
  can: (code: PermissionCode | PermissionCode[]) => boolean
  canAny: (codes: PermissionCode[]) => boolean
  canAll: (codes: PermissionCode[]) => boolean
  scopeAtLeast: (scope: Scope) => boolean
  scope: Scope | null
  isAdmin: boolean
}

export function usePermission(): UsePermissionReturn {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions, hasScope } = useAuthStore()

  return {
    can: hasPermission,
    canAny: hasAnyPermission,
    canAll: hasAllPermissions,
    scopeAtLeast: hasScope,
    scope: user?.effectiveScope ?? null,
    // Shortcut: admin là người có scope 'all' + system permissions
    isAdmin: hasScope('all') && hasPermission(PERMISSIONS.SYSTEM.ROLE.VIEW),
  }
}

// ─── Selector hooks nhỏ để tránh re-render không cần thiết ───────────────────

export function useCanCreateProduct() {
  return useAuthStore((s) => s.hasPermission(PERMISSIONS.PRODUCTS.CREATE))
}
```

---

## 7. Route Protection

### 7.1 PermissionRoute component

```typescript
// components/common/PermissionRoute.tsx

interface PermissionRouteProps {
  permission?: PermissionCode | PermissionCode[]
  anyOf?: PermissionCode[]
  scope?: Scope
  redirectTo?: string
  children: ReactNode
}

export const PermissionRoute: FC<PermissionRouteProps> = ({
  permission,
  anyOf,
  scope,
  redirectTo = '/403',
  children,
}) => {
  const { can, canAny, scopeAtLeast, isAuthenticated } = usePermission()
  const location = useLocation()

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check permission
  if (permission && !can(permission)) {
    return <Navigate to={redirectTo} replace />
  }

  if (anyOf && !canAny(anyOf)) {
    return <Navigate to={redirectTo} replace />
  }

  // Check scope
  if (scope && !scopeAtLeast(scope)) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
```

### 7.2 Router với permission guards

```typescript
// app/router.tsx

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [

      // ── Sản phẩm ────────────────────────────────────────────────────────
      {
        path: 'products',
        element: (
          <PermissionRoute permission={PERMISSIONS.PRODUCTS.VIEW}>
            <Suspense fallback={<PageLoader />}>
              <ProductListPage />
            </Suspense>
          </PermissionRoute>
        ),
      },

      // ── Phiếu yêu cầu HR ────────────────────────────────────────────────
      {
        path: 'hr/requests',
        element: (
          <PermissionRoute permission={PERMISSIONS.HR.REQUEST.VIEW}>
            <Suspense fallback={<PageLoader />}>
              <HrRequestListPage />
            </Suspense>
          </PermissionRoute>
        ),
      },

      // ── Báo cáo (cần scope department trở lên) ───────────────────────────
      {
        path: 'reports',
        element: (
          <PermissionRoute
            permission={PERMISSIONS.REPORTS.VIEW}
            scope="department"
          >
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          </PermissionRoute>
        ),
      },

      // ── System / Admin ────────────────────────────────────────────────────
      {
        path: 'system',
        element: (
          <PermissionRoute
            anyOf={[
              PERMISSIONS.SYSTEM.ROLE.VIEW,
              PERMISSIONS.SYSTEM.USER.VIEW,
              PERMISSIONS.SYSTEM.SETTINGS.VIEW,
            ]}
          >
            <Outlet />
          </PermissionRoute>
        ),
        children: [
          {
            path: 'roles',
            element: (
              <PermissionRoute permission={PERMISSIONS.SYSTEM.ROLE.VIEW}>
                <RoleListPage />
              </PermissionRoute>
            ),
          },
        ],
      },

      // ── Fallbacks ─────────────────────────────────────────────────────────
      { path: '403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```

---

## 8. Component-level Permission

### 8.1 `<Can>` wrapper component

```typescript
// components/common/Can.tsx

interface CanProps {
  // Phải có tất cả
  permission?: PermissionCode | PermissionCode[]
  // Có ít nhất 1
  anyOf?: PermissionCode[]
  // Check scope
  scope?: Scope
  // Thay vì ẩn hoàn toàn → disable (dùng cho buttons)
  disabled?: boolean
  // Fallback khi không có quyền
  fallback?: ReactNode
  children: ReactNode
}

export const Can: FC<CanProps> = ({
  permission,
  anyOf,
  scope,
  disabled = false,
  fallback = null,
  children,
}) => {
  const { can, canAny, scopeAtLeast } = usePermission()

  const permitted =
    (!permission || can(permission)) &&
    (!anyOf || canAny(anyOf)) &&
    (!scope || scopeAtLeast(scope))

  if (!permitted) {
    // Nếu disabled mode: clone children với disabled=true
    if (disabled && isValidElement(children)) {
      return cloneElement(children as ReactElement<{ disabled?: boolean }>, {
        disabled: true,
        title: 'Bạn không có quyền thực hiện thao tác này',
      })
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### 8.2 Sử dụng `<Can>` trong components

```typescript
// Ẩn hoàn toàn nút Thêm mới
<Can permission={PERMISSIONS.PRODUCTS.CREATE}>
  <Button onClick={handleCreate}>+ Thêm mới</Button>
</Can>

// Disable nút thay vì ẩn (người dùng biết tính năng tồn tại)
<Can permission={PERMISSIONS.PRODUCTS.EDIT} disabled>
  <Button onClick={() => handleEdit(id)}>Sửa</Button>
</Can>

// Check nhiều quyền — phải có cả hai
<Can permission={[PERMISSIONS.ORDERS.APPROVE, PERMISSIONS.ORDERS.VIEW]}>
  <ApproveButton />
</Can>

// Check ít nhất 1 trong các quyền
<Can anyOf={[PERMISSIONS.REPORTS.REVENUE, PERMISSIONS.REPORTS.INVENTORY]}>
  <ReportSection />
</Can>

// Fallback khi không có quyền
<Can
  permission={PERMISSIONS.PRODUCTS.DELETE}
  fallback={<span className="text-text-disabled">—</span>}
>
  <button onClick={() => handleDelete(id)}>Xóa</button>
</Can>

// Kết hợp scope
<Can permission={PERMISSIONS.HR.EMPLOYEE.VIEW} scope="department">
  <DepartmentEmployeeTable />
</Can>
```

### 8.3 Action Column trong Table

```typescript
// Cột thao tác thay đổi theo quyền

function useProductTableActions() {
  const { can } = usePermission()

  return useMemo(() => {
    const actions: TableAction<Product>[] = []

    if (can(PERMISSIONS.PRODUCTS.VIEW)) {
      actions.push({ label: 'Xem', icon: Eye, onClick: (row) => navigate(`/products/${row.id}`) })
    }
    if (can(PERMISSIONS.PRODUCTS.EDIT)) {
      actions.push({ label: 'Sửa', icon: Pencil, onClick: (row) => handleEdit(row.id) })
    }
    if (can(PERMISSIONS.PRODUCTS.DELETE)) {
      actions.push({
        label: 'Xóa',
        icon: Trash2,
        variant: 'danger',
        onClick: (row) => setDeleteTarget(row.id),
      })
    }

    return actions
  }, [can])
}

// Trong Table column definition:
{
  id: 'actions',
  header: 'Thao tác',
  cell: ({ row }) => <TableActionMenu actions={actions} row={row.original} />,
  enableSorting: false,
  size: 100,
  meta: { sticky: 'right' },
}
```

### 8.4 `usePermissionState` — cho form fields

```typescript
// Khi xem chi tiết: người không có quyền edit → tất cả field readonly

interface UseFormPermissionOptions {
  editPermission: PermissionCode
  isEditMode?: boolean
}

export function useFormPermission({ editPermission }: UseFormPermissionOptions) {
  const { can } = usePermission()
  const canEdit = can(editPermission)

  return {
    canEdit,
    // Helper: trả về props cho Input component
    fieldProps: (override?: { readOnly?: boolean }) => ({
      readOnly: override?.readOnly ?? !canEdit,
      disabled: !canEdit,
      className: !canEdit ? 'field-readonly' : '',
    }),
  }
}

// Sử dụng trong form:
const { canEdit, fieldProps } = useFormPermission({
  editPermission: PERMISSIONS.PRODUCTS.EDIT,
})

<Input {...register('name')} {...fieldProps()} label="Tên sản phẩm" />
<Button type="submit" hidden={!canEdit}>Lưu</Button>
```

---

## 9. Sidebar & Navigation Adaptation

### 9.1 Menu config với permission

```typescript
// constants/menu.config.ts

export interface MenuItem {
  key: string
  label: string
  icon: LucideIcon
  path?: string
  permission?: PermissionCode | PermissionCode[]
  anyOf?: PermissionCode[]
  scope?: Scope
  children?: MenuItem[]
}

export const MENU_CONFIG: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    path: '/',
    // Không cần permission — ai cũng xem được
  },
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS.VIEW,
    children: [
      {
        key: 'product-list',
        label: 'Danh sách sản phẩm',
        icon: List,
        path: '/products',
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
      {
        key: 'product-categories',
        label: 'Danh mục',
        icon: Tag,
        path: '/products/categories',
        permission: PERMISSIONS.PRODUCTS.VIEW,
      },
    ],
  },
  {
    key: 'warehouse',
    label: 'Kho hàng',
    icon: Warehouse,
    anyOf: [
      PERMISSIONS.WAREHOUSE.IMPORT_VOUCHER.VIEW,
      PERMISSIONS.WAREHOUSE.EXPORT_VOUCHER.VIEW,
    ],
    children: [
      {
        key: 'import-vouchers',
        label: 'Phiếu nhập kho',
        icon: ArrowDownToLine,
        path: '/warehouse/imports',
        permission: PERMISSIONS.WAREHOUSE.IMPORT_VOUCHER.VIEW,
      },
      {
        key: 'export-vouchers',
        label: 'Phiếu xuất kho',
        icon: ArrowUpFromLine,
        path: '/warehouse/exports',
        permission: PERMISSIONS.WAREHOUSE.EXPORT_VOUCHER.VIEW,
      },
    ],
  },
  {
    key: 'hr',
    label: 'Nhân sự',
    icon: Users,
    anyOf: [PERMISSIONS.HR.EMPLOYEE.VIEW, PERMISSIONS.HR.REQUEST.VIEW],
    children: [
      {
        key: 'employees',
        label: 'Nhân viên',
        icon: UserRound,
        path: '/hr/employees',
        permission: PERMISSIONS.HR.EMPLOYEE.VIEW,
        scope: 'department',   // Phải có scope department trở lên
      },
      {
        key: 'hr-requests',
        label: 'Phiếu yêu cầu',
        icon: FileText,
        path: '/hr/requests',
        permission: PERMISSIONS.HR.REQUEST.VIEW,
      },
    ],
  },
  {
    key: 'reports',
    label: 'Báo cáo',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS.VIEW,
    scope: 'department',
  },
  {
    key: 'system',
    label: 'Hệ thống',
    icon: Settings,
    anyOf: [
      PERMISSIONS.SYSTEM.ROLE.VIEW,
      PERMISSIONS.SYSTEM.USER.VIEW,
      PERMISSIONS.SYSTEM.SETTINGS.VIEW,
    ],
    children: [
      {
        key: 'roles',
        label: 'Phân hệ người dùng',
        icon: ShieldCheck,
        path: '/system/roles',
        permission: PERMISSIONS.SYSTEM.ROLE.VIEW,
      },
      {
        key: 'users',
        label: 'Tài khoản',
        icon: UserCog,
        path: '/system/users',
        permission: PERMISSIONS.SYSTEM.USER.VIEW,
      },
    ],
  },
]
```

### 9.2 Sidebar lọc menu theo quyền

```typescript
// hooks/useFilteredMenu.ts

function checkMenuItemPermission(item: MenuItem, can: Function, canAny: Function, scopeAtLeast: Function): boolean {
  const permOk = !item.permission || can(item.permission)
  const anyOk  = !item.anyOf    || canAny(item.anyOf)
  const scopeOk = !item.scope   || scopeAtLeast(item.scope)
  return permOk && anyOk && scopeOk
}

export function useFilteredMenu(): MenuItem[] {
  const { can, canAny, scopeAtLeast } = usePermission()

  return useMemo(() => {
    function filterItems(items: MenuItem[]): MenuItem[] {
      return items
        .filter((item) => checkMenuItemPermission(item, can, canAny, scopeAtLeast))
        .map((item) => ({
          ...item,
          children: item.children
            ? filterItems(item.children)
            : undefined,
        }))
        // Bỏ group cha nếu không có children nào hiển thị được
        .filter((item) => !item.children || item.children.length > 0)
    }

    return filterItems(MENU_CONFIG)
  }, [can, canAny, scopeAtLeast])
}
```

### 9.3 Breadcrumb thay đổi theo phân hệ

```typescript
// hooks/useBreadcrumb.ts
// Breadcrumb tự động từ route + menu config

export function useBreadcrumb(): BreadcrumbItem[] {
  const location = useLocation()
  const filteredMenu = useFilteredMenu()
  const { user } = useAuth()

  return useMemo(() => {
    // Tìm path trong menu config
    const crumbs = findBreadcrumbPath(filteredMenu, location.pathname)

    // Thêm scope label vào breadcrumb nếu scope !== 'all'
    // VD: "Nhân sự / Phiếu yêu cầu (Phòng ban)"
    if (user?.effectiveScope !== 'all' && crumbs.length > 0) {
      const last = crumbs[crumbs.length - 1]
      return [
        ...crumbs.slice(0, -1),
        {
          ...last,
          label: `${last.label}`,
          scopeLabel: SCOPE_LABELS[user.effectiveScope],
        },
      ]
    }

    return crumbs
  }, [location.pathname, filteredMenu, user])
}
```

---

## 10. Auth Flow & Token

### 10.1 Login flow

```
1. POST /auth/login { username, password }
2. BE trả về:
   {
     accessToken: string   (JWT, exp: 15m)
     refreshToken: string  (opaque, exp: 7d)
     user: AuthUser        (đã include permissions[], effectiveScope)
   }
3. FE: authStore.setAuth(user, accessToken)
       lưu refreshToken vào httpOnly cookie (BE set)
4. Axios interceptor: attach Authorization: Bearer <accessToken>
5. Khi 401: tự động call POST /auth/refresh → lấy accessToken mới
```

### 10.2 Permission refresh

```typescript
// Khi admin thay đổi quyền của user đang đăng nhập:
// BE: set flag "permission_changed" trong Redis cho userId
// FE: mỗi lần refresh token → BE check flag → trả về permissions mới trong response
// FE: cập nhật authStore với permissions mới

// Alternative đơn giản hơn:
// BE set accessToken exp ngắn (15 phút)
// Sau 15 phút user phải refresh → tự động nhận permissions mới
```

---

## 11. Admin UI — Quản lý Phân hệ

### 11.1 Layout trang danh sách phân hệ

```
┌──────────────────────────────────────────────────────────────┐
│  Phân hệ người dùng                  [+ Thêm phân hệ]       │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Tìm kiếm phân hệ...]           [Trạng thái: Tất cả ▼] │
├──────────────────────────────────────────────────────────────┤
│  Tên phân hệ        │ Phạm vi    │ Số quyền │ Thao tác      │
├─────────────────────┼────────────┼──────────┼───────────────┤
│  Admin              │ 🌐 Tất cả  │ 48/48    │ Sửa  [•••]   │
│  Trưởng phòng kho   │ 🏢 Phòng ban│ 12/48   │ Sửa  [•••]   │
│  Nhân viên kho      │ 👤 Cá nhân │ 6/48     │ Sửa  [•••]   │
│  Kế toán            │ 🏢 Phòng ban│ 18/48   │ Sửa  [•••]   │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Form tạo/sửa phân hệ — với Permission Checkbox UI

```
┌────────────────────────────────────────────────────────────────────────┐
│  Thêm phân hệ mới                                                   ✕ │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  Tên phân hệ *          Mã phân hệ *          Phạm vi *               │
│  [__________________]   [_______________]      [Cá nhân        ▼]     │
│                                                                        │
│  Mô tả                                                                 │
│  [______________________________________________________________]      │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  PHÂN QUYỀN                              [☐ Chọn tất cả]              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ▼ 📦 Quản lý sản phẩm              [☐ Chọn tất cả nhóm này]         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ☑ Xem sản phẩm          ☐ Thêm sản phẩm    ☐ Sửa sản phẩm   │  │
│  │  ☐ Xóa sản phẩm          ☐ Xuất Excel       ☐ Nhập từ file    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ▶ 🏭 Quản lý kho hàng             [☐ Chọn tất cả nhóm này]         │
│                                                                        │
│  ▼ 📋 Quản lý đơn hàng             [☑ Tất cả] ← khi chọn hết        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ☑ Xem đơn hàng          ☑ Tạo đơn hàng    ☑ Sửa đơn hàng   │  │
│  │  ☑ Hủy đơn hàng          ☑ Duyệt đơn hàng  ☑ Xuất Excel      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ▶ 👥 Quản lý nhân sự              [☐ Chọn tất cả nhóm này]         │
│  ▶ 📊 Báo cáo                      [☐ Chọn tất cả nhóm này]         │
│  ▶ ⚙️ Hệ thống                     [☐ Chọn tất cả nhóm này]         │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│  Đã chọn: 14 / 48 quyền                        [Hủy]  [Lưu phân hệ] │
└────────────────────────────────────────────────────────────────────────┘
```

### 11.3 Component PermissionCheckboxGroup

```typescript
// features/roles/components/PermissionCheckboxPanel.tsx

interface PermissionCheckboxPanelProps {
  groups: PermissionGroup[]
  selected: string[]            // permission codes đã chọn
  onChange: (codes: string[]) => void
  disabled?: boolean
}

const PermissionCheckboxPanel: FC<PermissionCheckboxPanelProps> = ({
  groups,
  selected,
  onChange,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  // Toggle toàn bộ
  const handleSelectAll = (checked: boolean) => {
    const all = groups.flatMap((g) => g.permissions.map((p) => p.code))
    onChange(checked ? all : [])
  }

  // Toggle cả nhóm
  const handleGroupToggle = (group: PermissionGroup, checked: boolean) => {
    const groupCodes = group.permissions.map((p) => p.code)
    if (checked) {
      onChange([...new Set([...selected, ...groupCodes])])
    } else {
      onChange(selected.filter((c) => !groupCodes.includes(c)))
    }
  }

  // Toggle từng quyền
  const handlePermToggle = (code: string, checked: boolean) => {
    onChange(checked ? [...selected, code] : selected.filter((c) => c !== code))
  }

  const allCodes = groups.flatMap((g) => g.permissions.map((p) => p.code))
  const totalSelected = selected.length

  return (
    <div className="permission-panel">
      {/* Header: chọn tất cả */}
      <div className="panel-header">
        <Checkbox
          checked={totalSelected === allCodes.length}
          indeterminate={totalSelected > 0 && totalSelected < allCodes.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          label="Chọn tất cả"
        />
        <span className="text-sm text-text-secondary">
          Đã chọn: {totalSelected} / {allCodes.length} quyền
        </span>
      </div>

      {/* Các nhóm quyền */}
      {groups.map((group) => {
        const groupCodes = group.permissions.map((p) => p.code)
        const selectedInGroup = groupCodes.filter((c) => selected.includes(c))
        const isExpanded = expandedGroups.includes(group.code)

        return (
          <div key={group.code} className="permission-group">
            {/* Group header */}
            <div className="group-header" onClick={() => toggleExpand(group.code)}>
              <ChevronIcon expanded={isExpanded} />
              <Checkbox
                checked={selectedInGroup.length === groupCodes.length}
                indeterminate={selectedInGroup.length > 0 && selectedInGroup.length < groupCodes.length}
                onChange={(e) => handleGroupToggle(group, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                label={group.name}
              />
              <span className="count-badge">
                {selectedInGroup.length}/{groupCodes.length}
              </span>
            </div>

            {/* Permission checkboxes */}
            {isExpanded && (
              <div className="permission-grid">
                {group.permissions.map((perm) => (
                  <Checkbox
                    key={perm.code}
                    checked={selected.includes(perm.code)}
                    onChange={(e) => handlePermToggle(perm.code, e.target.checked)}
                    label={perm.name}
                    title={perm.code}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### 11.4 Trang gán phân hệ cho User

```
┌──────────────────────────────────────────────────────────────┐
│  Nguyễn Văn A — Phân hệ được gán                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Phân hệ hiện tại:                                          │
│  ┌───────────────────────────┐                              │
│  │ 🏢 Nhân viên kho    👤   ✕│  ← badge scope              │
│  │ 📋 Kế toán cơ bản   🏢  ✕│                              │
│  └───────────────────────────┘                              │
│                                                              │
│  Phạm vi hiệu quả: 🏢 Phòng ban  ← resolved từ 2 phân hệ   │
│                                                              │
│  Thêm phân hệ:   [Chọn phân hệ...   ▼]  [+ Gán]           │
│                                                              │
│  ── Tóm tắt quyền hiện có ──────────────────────────────── │
│  ✓ Xem sản phẩm    ✓ Xem đơn hàng   ✓ Xem phiếu nhập kho  │
│  ✓ Tạo phiếu       ✗ Sửa sản phẩm  ✗ Xóa bất kỳ          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Ví dụ end-to-end

### 12.1 Scenario: Trưởng phòng kho xem trang Phiếu nhập kho

```
1. Login → JWT payload:
   {
     permissions: ['warehouse:view', 'warehouse:import_voucher:view',
                   'warehouse:import_voucher:create', 'warehouse:import_voucher:approve'],
     effectiveScope: 'department'
   }

2. Sidebar: chỉ hiển thị "Kho hàng > Phiếu nhập kho" (Phiếu xuất không có quyền)

3. Navigate /warehouse/imports:
   PermissionRoute check → has 'warehouse:import_voucher:view' → cho qua

4. Trang render:
   - Toolbar: nút [+ Tạo phiếu] hiển thị (có quyền create)
   - Toolbar: nút [Duyệt hàng loạt] hiển thị (có quyền approve)
   - Cột Thao tác: [Xem] [Duyệt] — không có [Xóa] (không có quyền)

5. Dữ liệu bảng:
   FE gửi GET /warehouse/import-vouchers
   BE check: user có 'warehouse:import_voucher:view' ✓
   BE check scope: effectiveScope = 'department'
   → Query WHERE department_id = user.departmentId
   → Chỉ trả về phiếu của phòng ban, không phải toàn công ty
```

### 12.2 Scenario: Admin thêm quyền mới cho phân hệ

```
1. Admin vào /system/roles → chọn "Trưởng phòng kho" → Sửa
2. Tick thêm ô "Xem báo cáo kho" (warehouse:report:view)
3. PUT /system/roles/:id { permissionCodes: [..., 'warehouse:report:view'] }
4. BE: update DB + set Redis flag "perm_changed:{userId}" cho tất cả user
      đang dùng phân hệ này
5. Lần tiếp theo các user đó refresh token:
   → BE detect flag → tính lại permissions → trả về JWT mới
   → FE authStore cập nhật → Sidebar tự hiện thêm menu Báo cáo kho
```

### 12.3 Scope so sánh trực quan

```
Trang: Phiếu yêu cầu nhân sự (/hr/requests)

┌──────────────────────────────────────────────────────────────────────┐
│ Nhân viên thường (scope: self)                                       │
│ Bảng chỉ hiện: phiếu do chính mình tạo                              │
│ Nút [+ Tạo phiếu] hiển thị                                          │
│ Không thấy phiếu của đồng nghiệp                                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ Trưởng phòng (scope: department)                                     │
│ Bảng hiện: tất cả phiếu của phòng mình                              │
│ Thêm cột "Người tạo" (tự nhiên hơn khi nhìn nhiều người)            │
│ Nút [Duyệt] xuất hiện ở cột thao tác                                │
│ Filter mặc định: Phòng ban = [phòng của mình]                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ Admin (scope: all)                                                   │
│ Bảng hiện: tất cả phiếu toàn công ty                                │
│ Thêm cột "Phòng ban" và filter "Phòng ban"                          │
│ Không pre-filter — thấy tất cả mặc định                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Checklist triển khai module phân quyền

**Database**
- [ ] Bảng `roles`, `permissions`, `permission_groups`, `role_permissions`, `user_roles`
- [ ] Seed dữ liệu: tất cả permissions + groups
- [ ] Seed role Admin với tất cả permissions
- [ ] Index trên `role_permissions(role_id)`, `user_roles(user_id)`

**Backend**
- [ ] `PermissionGuard` hoạt động đúng với `@RequirePermissions()`
- [ ] `ScopeGuard` áp dụng đúng cho endpoint cần giới hạn dữ liệu
- [ ] JWT payload đầy đủ: `permissions[]`, `effectiveScope`
- [ ] Refresh token trả về permissions mới khi có flag thay đổi
- [ ] CRUD APIs cho roles: GET/POST/PUT/DELETE `/system/roles`
- [ ] API GET `/system/permission-groups` — trả về cấu trúc nhóm quyền cho FE

**Frontend**
- [ ] `useAuthStore` với helpers `hasPermission`, `hasScope`
- [ ] `usePermission` hook
- [ ] `<Can>` component với `disabled` mode
- [ ] `<PermissionRoute>` guard
- [ ] `useFilteredMenu` — sidebar lọc đúng
- [ ] `constants/permissions.ts` — tất cả permission codes
- [ ] `MENU_CONFIG` khai báo permission cho từng menu item
- [ ] Table action column dùng `usePermission`

**Admin UI**
- [ ] Trang danh sách phân hệ
- [ ] Form tạo/sửa phân hệ với `PermissionCheckboxPanel`
- [ ] Expand/collapse từng nhóm quyền
- [ ] Checkbox indeterminate khi chọn một phần
- [ ] Badge đếm số quyền đã chọn / tổng
- [ ] Trang gán phân hệ cho user
- [ ] Hiển thị scope hiệu quả sau khi gán nhiều phân hệ
- [ ] Tóm tắt quyền đang có (read-only summary)
