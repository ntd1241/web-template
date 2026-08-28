# Form Builder

Use the form builder for reusable create/edit forms backed by react-hook-form and zod. The registry
and command source of truth is [`src/builders/README.md`](../../src/builders/README.md).

Control JSX is emitted through the shared lower-level form-field builder at
[`src/builders/shared/form-field-builder.ts`](../../src/builders/shared/form-field-builder.ts),
so new higher-level form surfaces should reuse that builder instead of mapping field kinds to UI
primitives again. The control-level Zod schemas live in
[`src/builders/shared/form-field-spec.ts`](../../src/builders/shared/form-field-spec.ts); this form
schema extends them with form-only metadata such as `label`, `width`, and `required`.

## Generated Exports

From one `FormSpec`, the builder emits one `*-form.generated.tsx` file with named exports:

- `<Entity>Form` — inline form core only. It receives `form`, `onSubmit`, optional `id`, and any
  prop-fed option arrays. It has no dialog chrome, padding, or buttons.
- `<Entity>FormDialog` — thin dialog wrapper. It receives `open`, `onOpenChange`, parent-owned
  `form`, `onSubmit`, optional `title`, and forwards prop-fed option arrays to `<Entity>Form`.
- `use<Entity>Form(options?)` — creates the RHF instance with `zodResolver(<schema>)` and generated
  defaults wired in. The page owns this instance.
- `<entity>DefaultValues` — exported default values derived from the field kind registry.
- `map<Entity>ToFormValues(entity)` — edit-mode mapper scaffold. Replace the generated
  `unknown` source alias with the real entity type and fill the TODO body.

The dialog header does not render a description by default. Add `description` to the `FormSpec`
only when the dialog needs supporting guidance; otherwise the builder omits both the description
element and its unused import.

Static select-like options are emitted as module constants only when `optionsFrom` is omitted or
`'static'`.

## Workflow

1. Reuse or create the feature's zod create/edit schema and inferred values type.
2. Create `<domain>/form/<entity>.form.fixture.ts` exporting a `FormSpec` from `@/builders/form`.
   Define `entity`, `schemaImport`, `schemaName`, `valuesType`, `title`, optional `description`, and
   `fields`.
3. Generate the artifact:

   ```bash
   npm run gen:form -- <spec.ts> <out.tsx>
   ```

   Example:

   ```bash
   npm run gen:form -- src/builders/form/__fixtures__/supplier.form.fixture.ts src/builders/form/__fixtures__/supplier-form.generated.tsx
   ```

4. Keep the provenance banner. Own the output and fill page-specific submit, edit mapping, pending,
   success, and failure behavior in the parent.
5. Let the page own dialog visibility, selected entity, fetched option data, and the RHF instances.
   The generated dialog receives a required `mode="create" | "edit"`; edit mode automatically
   confirms accidental close through the shared `ConfirmDialog`.
6. Run focused form/dialog tests and `npm run build`.

## Field Kinds

| Kind              | Project control       | Binding                                                      |
| ----------------- | --------------------- | ------------------------------------------------------------ |
| `text`            | `Input`               | `{...field}`                                                 |
| `number`          | `Input type="number"` | `{...field}`; prefer `z.coerce.number()` for numeric schemas |
| `date`            | `DatePickerInput`     | `value`, `onChange`, and `onBlur`                            |
| `textarea`        | `Textarea`            | `{...field}`                                                 |
| `select`          | `OptionSelect`        | `value` and `onChange`; local search is disabled              |
| `combobox`        | `OptionSelect`        | `value` and `onChange`; searchable                            |
| `searchSelect`    | `OptionSelect`        | `value` and `onChange`; searchable                            |
| `apiSearchSelect` | `ApiOptionSelect`     | `value` and `onChange`, plus a generated server-side loader  |
| `customerSelect`  | `CustomerSelect`      | `value` and `onChange`; the component owns customer fetching |
| `inputSelect`     | `InputSelect`         | primary input field + secondary select field                 |
| `multiselect`     | `MultiSelect`         | `value` and `onChange`                                       |
| `switch`          | `Switch`              | `checked` and `onCheckedChange`                              |

Date fields may set `format: 'display' | 'iso'`; number fields may set
`format: 'plain' | 'currency' | 'percent'`. These semantic presets are defined once by the shared
field schema and mapped to runtime controls by the field renderer.

Width presets use the responsive 12-column grid: `normal` is 6 columns, `large` is 8, and `full` is 12. Fields stack on mobile. If a field omits `width`, the builder defaults it to `full`; use `normal` or `large` only when a field is intentionally part of a split row.

Set `breakBefore: true` when a field should begin at the first desktop grid column, leaving the unused columns from the previous field on their own row.

`inputSelect` binds the text/number input to `name` and the trailing select to `selectName`.
Declare `selectOptions` for a static list or set `selectOptionsFrom: 'prop'` to receive
`<name>SelectOptions` from the page. The secondary field is included in generated default values;
its initial value uses `selectDefaultValue`, then the first static option, then an empty string.

### Data-driven select contract

`OptionSelect` is the canonical data-driven single-select component. It accepts a shared
`SelectOption` shape (`value`, `label`, optional `searchableText`, `group`, `data`, and `disabled`)
and exposes `searchable` to control whether the popover renders a search input. Local filtering uses
`searchableText` when provided and otherwise falls back to the option label/value.

Clicking the selected option again clears it by default. Set `canDeselect={false}` when a form field
must keep its current value. For server-side search, use `ApiOptionSelect`; it keeps the same option
contract and sends the query to the supplied loader instead of filtering the full client-side list.

`Select` remains available as the low-level Radix/shadcn composition API for special layouts such as
`inputSelect` or custom static menus. `SelectSearch`, `ApiSelectSearch`, and `Combobox` remain
backward-compatible aliases, but new builder output and new data-driven usage should use
`OptionSelect`/`ApiOptionSelect`. `MultiSelect` keeps its multi/nested selection behavior while
sharing the base `SelectOption` fields.

Use `modes: ['create']` or `modes: ['edit']` when a field belongs to only one
dialog mode. The generated inline form receives the dialog's `mode` automatically;
fields without `modes` remain visible in both modes. Keep the field in the shared
schema/default values when create should submit a system default without exposing
an editable control, for example an `active` status.

## Create/Edit Wiring

Use separate create/edit dialog state and form instances:

```tsx
const [createOpen, setCreateOpen] = useState(false);
const [editOpen, setEditOpen] = useState(false);
const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
const createForm = useSupplierForm();
const editForm = useSupplierForm();

function openCreate() {
  // Keep the create draft. Do not reset it on open or close.
  setCreateOpen(true);
}

function openEdit(supplier: Supplier) {
  setEditSupplier(supplier);
  editForm.reset(mapSupplierToFormValues(supplier));
  setEditOpen(true);
}

<SupplierFormDialog
  open={createOpen}
  onOpenChange={setCreateOpen}
  mode="create"
  form={createForm}
  onSubmit={handleSubmit}
  isSaving={createMutation.isPending}
  title="Thêm nhà cung cấp"
  regionOptions={regionOptions}
/>;

<SupplierFormDialog
  open={editOpen}
  onOpenChange={setEditOpen}
  mode="edit"
  form={editForm}
  onSubmit={handleEditSubmit}
  isSaving={editMutation.isPending}
  title="Sửa nhà cung cấp"
  regionOptions={regionOptions}
/>;
```

- The create dialog keeps its draft when closed and reopened; context-only defaults may use
  `form.setValue` without resetting the form.
- Opening edit assigns the selected entity first, then maps it into the edit form and resets it.
- A pending mutation cannot submit twice.
- Pass the mutation pending state through `isSaving`; the generated submit button forwards it to
  the shared `Button` `loading` prop and the cancel button is disabled until the mutation settles.
- Success invalidates affected queries, shows feedback, and then closes the dialog.
- Failure keeps the dialog and entered values open and shows normalized feedback.
- `mode="edit"` confirms overlay click, Escape, the close button, and Cancel before closing.

### Dialog lifecycle pattern

Keep dialog visibility and the entity being edited in separate state values:

- `createOpen` and `editOpen` control visibility independently.
- `editSupplier` keeps the source entity stable during the edit close animation.
- Do not immediately clear `editSupplier` or reset `editForm` while the edit dialog is closing. The
  next edit action replaces the entity and resets the form with fresh values.
- The generated edit dialog owns the confirmation boundary; the page only supplies `setEditOpen`.

This prevents a closing dialog from switching mode mid-animation, such as briefly showing a
create-only field while editing. It also prevents submitted values from appearing to change before
the dialog disappears. Failed submissions keep both the dialog and entered values unchanged.

The page may render `<Entity>Form` inline for a full page or drawer surface and reuse the same
`use<Entity>Form()` instance, submit callback, mapper, and option props.

## API-Fetched Options

For `select`, `combobox`, `searchSelect`, and `multiselect`, set `optionsFrom: 'prop'` when options come from the
page instead of a static list. For `inputSelect`, use `selectOptionsFrom: 'prop'` for the trailing select:

```ts
{
  kind: 'combobox',
  name: 'region',
  label: 'Khu vực',
  placeholder: 'Chọn khu vực',
  optionsFrom: 'prop',
}
```

The generated components require a `<fieldName>Options` prop. Types are:

- `select`/`combobox`/`searchSelect` → `SelectOption[]`
- `multiselect` → `MultiSelectOption[]`
- `inputSelect` → `{ value: string; label: string }[]` exposed as `<name>SelectOptions`

Fetch options at the page boundary and pass them down:

```tsx
const regionsQuery = useQuery({
  queryKey: ['regions', 'options'],
  queryFn: fetchRegionOptions,
});

const regionOptions = (regionsQuery.data ?? []).map((region) => ({
  value: region.id,
  label: region.name,
}));

<SupplierFormDialog
  open={open}
  onOpenChange={setOpen}
  form={form}
  onSubmit={handleSubmit}
  regionOptions={regionOptions}
/>;
```

Do not move server calls into the generated artifact. Keep server state in React Query at the page or
feature boundary, then pass serializable option arrays to the generated form.

For API-backed search, use `apiSearchSelect`. The generated form receives a loader and an optional
selected option so edit forms can display the current label even before a search result is loaded:

```ts
{
  kind: 'apiSearchSelect',
  name: 'customer',
  label: 'Khách hàng',
  searchPlaceholder: 'Tìm khách hàng...',
  minSearchLength: 2,
  debounceMs: 300,
}
```

The parent implements `loadCustomerOptions({ search, signal })`; the component owns debounce,
request cancellation, loading, empty, and stale-response handling. The builder never embeds an API
URL or query hook in generated output.

## Ownership

- The schema owns validation; do not redeclare validation in the spec.
- The spec owns field structure, widths, required markers, static option constants, and prop option
  contracts.
- Generated output is scaffold-and-own. Never regenerate over customized logic; use a scratch path.
- Read [`components/forms.md`](../components/forms.md) only when customizing a generated control.
