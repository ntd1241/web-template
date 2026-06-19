# Shared Utilities

Use this index to find domain-neutral logic in `src/lib`. Read source and co-located tests for exact
signatures; do not duplicate implementations in feature code.

| Need | Source | Contract |
| --- | --- | --- |
| Validation messages and schema helpers | `src/lib/validation/` | Zod helpers with Vietnamese/i18n messages; cross-field rules remain in feature schemas |
| Number, currency, percent | `src/lib/format.ts` | Vietnamese `Intl.NumberFormat`; nullish/invalid values render safely |
| Date and relative time | `src/lib/date.ts` | Vietnamese date-fns formatting; invalid values render safely |
| Accent-insensitive search | `src/lib/search.ts` | Vietnamese normalization and matching for search controls |
| API error messages and field errors | `src/lib/errors.ts` | Narrow `unknown`, normalize messages, map field errors, show toast feedback |
| Axios client | `src/lib/axios.ts` | Shared base URL, auth, and API error normalization |
| React Query client | `src/lib/query-client.ts` | Shared server-state defaults |

## Rules

- Prefer an existing utility before creating a feature-local equivalent.
- Keep feature-specific validation and mapping in the owning feature.
- Accept `unknown` at error boundaries and narrow through shared helpers.
- Use the shared number/date utilities in table specs and generated cells.
- Add focused tests when changing a shared utility contract.

UI component lookup: [`06-component-usage-guide.md`](./06-component-usage-guide.md).
