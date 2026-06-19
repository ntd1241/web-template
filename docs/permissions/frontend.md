# Frontend Permissions

Read [`overview.md`](./overview.md) first. Frontend permission checks are UX only; the backend remains the
security boundary.

## Auth State

The auth store owns the authenticated user, token lifecycle, `permissions[]`, and `effectiveScope`.
Expose typed helpers equivalent to:

- `hasPermission(code | codes)` for required permissions.
- `hasAnyPermission(codes)` for alternatives.
- `hasAllPermissions(codes)` for combined requirements.
- `hasScope(required)` using the shared scope priority.

Do not persist derived helper results. Recompute them from current auth state.

## Permission Hook

Feature code uses one hook such as `usePermission()` rather than reading the store shape directly. Its
contract should provide `can`, `canAny`, `canAll`, `scopeAtLeast`, and current scope. Keep convenience
flags such as `isAdmin` tied to explicit permissions, not a username or role label.

## Routes

Protected routes check authentication first, then required permission and scope. Preserve the attempted
location for login redirects and use the project's forbidden route for authorization failures.

Route requirements may express:

- one permission;
- all required permissions;
- any of several permissions;
- a minimum scope.

Do not scatter route strings or permission literals through page components.

## Components And Actions

- Hide controls when the action should not be discoverable.
- Disable controls when users should understand the feature exists but is unavailable.
- Filter table row actions through the permission hook before rendering.
- Make forms read-only when view is allowed but update is not.
- Do not rely on disabled UI to prevent a mutation call; guard the handler as well.

A shared `Can`-style wrapper may support permission, alternatives, scope, disabled mode, and fallback.
Keep domain decisions in the feature rather than expanding the wrapper with business rules.

## Navigation

Menu config stores typed permission and scope requirements. Filter children recursively, remove empty
groups, and generate breadcrumbs from the filtered route/menu contract. Navigation filtering must not
be treated as authorization.

## Tests

- Auth helpers for one, any, all, and scope checks.
- Route access for unauthenticated, forbidden, and allowed users.
- Hidden versus disabled component behavior.
- Menu filtering, empty groups, and mixed-role permissions.
- Create/edit actions when view and update permissions differ.
