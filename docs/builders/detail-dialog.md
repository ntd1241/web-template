# Detail-dialog builder

The detail-dialog builder scaffolds a reusable dialog for local data. Its default
tab layout is a two-column information table. The generated component never
fetches data. Each tab receives the local entity and the current search query so
the feature can render fields or switch a tab to a fully custom layout.

## Spec

```ts
const spec = {
  componentName: 'ContractDetailDialogShell',
  tabs: [
    {
      value: 'general',
      label: 'Thông tin chung',
      icon: 'Info',
      searchTextProp: 'generalSearchText',
    },
    {
      value: 'custom',
      label: 'Tùy biến',
      contentMode: 'custom',
      contentProp: 'customContent',
    },
  ],
} satisfies DetailDialogSpec;
```

Each default `table` tab generates a field renderer prop named `<value>Fields`.
Each `custom` tab generates a content renderer prop named `<value>Content`.
Both receive:

```ts
{
  data,
  searchQuery,
  matches,
}
```

`matches` uses the shared accent-insensitive fuzzy matcher. All configured tabs
remain visible while searching; table fields are filtered automatically and
custom content remains responsible for its own row-level filtering.

When a tab should show the number of matching items while searching, declare
`searchMatchCountProp`. The callback receives the same context and should return
the number of matching rows/items. The shared dialog renders a solid count badge
next to the tab label while a search is active when the count is greater than
zero.

Generate with:

```sh
npm run gen:detail-dialog -- src/project/example/detail-dialog.fixture.ts src/project/example/detail-dialog.generated.tsx
```
