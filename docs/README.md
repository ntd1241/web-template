# Documentation Router

Start from the task, not from the document number. Read only the listed files and current code.

| Task | Required reading | Conditional reading |
| --- | --- | --- |
| Implement a UI page or surface | [`workflows/implement-ui.md`](./workflows/implement-ui.md), [`src/builders/README.md`](../src/builders/README.md) | Matching `builders/*`; matching `components/*` only for customization |
| Add or edit a form dialog | [`workflows/implement-ui.md`](./workflows/implement-ui.md), [`builders/form-dialog.md`](./builders/form-dialog.md) | [`components/forms.md`](./components/forms.md), [`07-lib-utilities.md`](./07-lib-utilities.md) |
| Add or edit a data table | [`workflows/implement-ui.md`](./workflows/implement-ui.md), [`builders/table.md`](./builders/table.md) | [`components/data-grid.md`](./components/data-grid.md) |
| Add a feature or wire API state | [`00-stack-and-architecture.md`](./00-stack-and-architecture.md) | Relevant sections of [`01-coding-convention.md`](./01-coding-convention.md) |
| Change shared styling or UX rules | [`02-design-system.md`](./02-design-system.md), [`06-component-usage-guide.md`](./06-component-usage-guide.md) | Matching `components/*` |
| Implement permissions | [`permissions/overview.md`](./permissions/overview.md) | One of `frontend.md`, `backend.md`, `admin-ui.md` |
| Create or extend a builder | [`builders/authoring.md`](./builders/authoring.md) | Existing builder source and tests |

`reference/` and `engineering/` are opt-in. Do not read them for ordinary implementation tasks.
Current code and `package.json` win when documentation is stale.
