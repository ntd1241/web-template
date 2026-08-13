# Permission System Overview

Start here only for authentication, RBAC, scope, route guards, menu filtering, or role-management work.
Then read one focused guide:

- [`frontend.md`](./frontend.md): stores, hooks, routes, components, and navigation.
- [`backend.md`](./backend.md): JWT, permission enforcement, and scoped queries.
- [`admin-ui.md`](./admin-ui.md): role, module, and assignment screens.

## Model

- A **permission** authorizes one action on one resource.
- A **role** (phân hệ) groups permissions and one data scope.
- A user may have multiple roles; permissions are their union.
- `effectiveScope` is the widest scope granted by those roles.
- Permission groups organize admin UI only; they do not imply runtime inheritance.

## Permission Codes

Use `resource:action` or `module:resource:action` with lowercase snake-case segments, for example:

```text
products:view
products:create
warehouse:import_voucher:approve
system:role:update
```

- Standard actions are `view`, `create`, `update`, `delete`, plus explicit domain actions such as
  `approve`, `export`, or `assign`.
- Define codes once in typed constants. Components and routes never hardcode permission strings.
- Backend and frontend consume the same generated or shared contract when possible.

## Scope

The fixed order is:

```text
self < department < all
```

When a user has several roles, resolve the widest scope by this order. Scope limits which records an
authorized action may affect; it never grants the action itself.

| Scope | Data boundary |
| --- | --- |
| `self` | records owned or created by the current user |
| `department` | records belonging to the user's department |
| `all` | unrestricted organizational records |

## Security Boundary

- Frontend checks improve UX by hiding, disabling, or redirecting.
- Backend permission checks authorize every protected endpoint.
- Backend scope checks constrain every protected query and resource mutation.
- Never trust route visibility, disabled controls, request filters, or JWT data without server-side
  validation.
- Refresh authentication state when role assignments or permission definitions change.

## Delivery Checklist

- Permission constants and scope types are canonical and typed.
- JWT/auth response carries the permissions and effective scope needed by the client.
- Backend guards and service queries enforce both action and scope.
- Routes, menus, actions, and form editability reflect the same permission contract.
- Tests cover denied actions, mixed roles, and all three scope boundaries.

## New Feature Permission Rule

Mỗi module hoặc chức năng nghiệp vụ mới phải được thiết kế cùng với authorization contract, không
đợi đến khi hoàn tất UI mới bổ sung quyền. Trước khi triển khai cần xác định:

- module và nhóm quyền phù hợp trong permission catalog;
- permission code ổn định theo dạng `module:resource:action`;
- các action cần thiết như `view`, `create`, `update`, `delete` và domain action riêng nếu có;
- role mặc định nào được nhận quyền và scope áp dụng;
- kiểm tra frontend để điều chỉnh menu/action và kiểm tra backend/RLS cho mọi endpoint, query,
  mutation liên quan.

Ví dụ module Nhãn sử dụng nhóm `system / tags` với các quyền `system:tag:view`,
`system:tag:create`, `system:tag:update` và `system:tag:delete`. Việc gắn nhãn
cho từng đối tượng là domain action riêng, cần bổ sung quyền `assign` khi chức năng đó được triển khai,
không tự suy ra từ quyền chỉnh sửa nhãn.
