# Permission Administration UI

Read [`overview.md`](./overview.md) first and use the normal
[`implement UI workflow`](../workflows/implement-ui.md). This guide covers only role and permission
management behavior.

## Role List

Show role code, Vietnamese name, scope, active state, assigned-user count, and actions. Support loading,
empty, error, search/filter, and pagination behavior through project components. Actions remain subject
to system role permissions.

## Create/Edit Role

The form owns:

- immutable or carefully migrated role code;
- Vietnamese display name and optional description;
- one scope from `self`, `department`, or `all`;
- active state;
- selected permission codes grouped for scanning.

Use the form builder for the ordinary fields. Permission selection is a domain-specific section added
to the owned scaffold.

## Permission Selection

- Group permissions by module/resource with Vietnamese labels.
- Support select group, clear group, and indeterminate group state.
- Keep selected values as canonical permission codes.
- Preserve unknown existing codes long enough to warn or migrate instead of silently deleting them.
- Search filters the display without changing hidden selections.
- Explain scope separately; scope selection does not auto-select permissions.

## User Assignment

Assignment UI shows current roles, effective permission/scope consequences, pending state, and clear
success/failure feedback. Confirm bulk removal or changes that can remove administrative access.

## Safety And Tests

- Prevent or strongly confirm deleting roles with assigned users according to backend policy.
- Protect the last viable administrator according to product rules.
- Test group selection and indeterminate behavior.
- Test create/edit defaults, retained selections, submit payload, and failed save.
- Test permission-aware visibility of role actions.
