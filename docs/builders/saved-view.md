# Saved-view builder

`saved-view` scaffolds the typed persistence adapter for a tenant-shared list view.
It normalizes legacy or incomplete JSON from the database back to the feature's initial
filter shape, validates enum arrays, and preserves column visibility/order.

```bash
npm run gen:saved-view -- <spec.ts> <out.ts>
```

The generated adapter does not own query state or UI. Feature hooks own filter state,
React Query and table state; `useTenantSavedViews`, `SavedViewsToolbar` and
`SavedViewFormDialog` provide the shared runtime behavior.

Use one spec next to each domain model. Edit the spec and regenerate only when the
persisted filter contract changes; generated files are scaffold-and-own outputs.
