# Component Usage Guide

Use project components instead of recreating base controls in feature code. This file is a router and
ownership contract; detailed APIs live in [`docs/components/`](./components/).

## Ownership Rules

- Base components live in `src/components/ui`.
- Shared appearance and Vietnamese defaults belong in component defaults or semantic tokens.
- Feature code may add domain composition, not duplicate Button, Input, Dialog, or DataGrid foundations.
- Do not hardcode hex colors or repeat shared `bg-*` patches across pages.
- Use Lucide icons and accessible names for unfamiliar icon-only actions.

## Lookup

| Need | Project API | Guide |
| --- | --- | --- |
| Button or icon action | `Button` | [`components/button.md`](./components/button.md) |
| Form controls | `Input`, `Select`, `Combobox`, `MultiSelect`, `NumericInput`, `Form*` | [`components/forms.md`](./components/forms.md) |
| Paginated table | `DataGrid`, `DataGridTable`, `DataGridPagination` | [`components/data-grid.md`](./components/data-grid.md) |
| Status and identity display | `Badge`, `StatusBadge`, `Avatar`, `RelativeTime` | [`components/display.md`](./components/display.md) |
| Modal or confirmation | `Dialog`, `Sheet`, `Drawer`, `AlertDialog` | inspect matching `src/components/ui` source |
| Shared formatting and validation | `src/lib/*` | [`07-lib-utilities.md`](./07-lib-utilities.md) |

For builder-covered surfaces, start from [`src/builders/README.md`](../src/builders/README.md), not the
component API.

## Review Checklist

- No reusable raw `<button>`, `<input>`, or `<table>` was introduced in a management feature.
- Existing shared component defaults were reused instead of restyled per page.
- Data tables use the table builder and `DataGrid` when the registry matches.
- Forms use the form builder when the registry matches.
- Vietnamese labels, validation, empty states, and feedback are complete.
- Icon controls have accessible names.
