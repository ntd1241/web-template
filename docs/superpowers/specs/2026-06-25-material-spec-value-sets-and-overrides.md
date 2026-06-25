# Material Specs — Value Sets, Repeatable Instances, And Overrides

Status: proposed design note  
Scope: `src/examples/material` technical-spec module, especially `SpecDefinition`,
`MaterialModelSpec`, option lists, color specs, and material/device overrides.

## Context

The current material-catalog example already has the useful base shape:

- `SpecDefinition` defines reusable spec metadata: data type, unit, options, default value,
  and whether models can override list values.
- `MaterialModelSpec` assigns a spec to a material model and can override default value and
  `allowedOptions`.
- `Material` stores only `specValues` for specs that the model marks as editable.

That covers the common case: one material model has one "Màu sắc" spec, and each real material
chooses one color from the model-specific list.

Two real cases expose the next design gap:

1. A single model may need more than one value for the same conceptual spec. Example: a pair of
   magnets is one model, but the two magnets have different colors. Encoding this as one option
   label like "Xanh-Đỏ" works, but it destroys searchable atomic values.
2. A single model may need the same spec category multiple times for different parts. Example:
   "Màu kính" and "Màu vỏ" are both color specs, but current UI prevents adding catalog "Màu sắc"
   more than once. Creating two custom specs works, but requires redefining the same color preset
   again and again.

## Current Implementation Notes

Current types:

```ts
interface SpecDefinition {
  id: string;
  code: string;
  name: string;
  dataType: SpecDataType;
  unit?: string;
  options?: SpecOption[];
  allowMultiple: boolean;
  allowDynamicValues: boolean;
  allowModelOverride: boolean;
  defaultValue?: SpecValue;
}

interface MaterialModelSpec {
  id: string;
  source: 'catalog' | 'custom';
  specDefinitionId?: string;
  customDefinition?: CustomSpecDefinition;
  materialValueMode: 'locked' | 'editable';
  defaultValue?: SpecValue;
  allowedOptions?: SpecOption[];
  isRequired: boolean;
  sortOrder: number;
}

interface MaterialSpecValue {
  materialModelSpecId: string;
  value: SpecValue;
}
```

Important behavior:

- Effective specs resolve in this order:
  - locked: `modelSpec.defaultValue ?? definition.defaultValue`
  - editable: `material.specValues` override, else model/default value
- List values are constrained to `modelSpec.allowedOptions ?? definition.options`.
- The model-spec editor currently prevents adding the same catalog spec twice by filtering used
  `specDefinitionId`s.

## Benchmark Signals

The common pattern in mature catalog/PIM systems is not "duplicate the attribute for every local
case". Instead, they separate attribute definition, reusable option values, product-template
assignment, and instance/variant values.

### Akeneo

Akeneo separates attribute types such as simple select and multi-select, and manages select options
from the attribute options tab. It also supports product models / variants where attributes can be
managed at different product levels.

Design signal for this module:

- Keep "single vs multi" as explicit behavior, not as encoded labels.
- Keep option lists reusable and manageable as first-class configuration.
- Use model-level assignment to decide which options apply to a specific product/model.

References:

- [Akeneo — Manage attributes](https://help.akeneo.com/serenity-build-your-catalog/serenity-manage-your-attributes)
- [Akeneo — Enrich products with variants](https://help.akeneo.com/serenity-take-the-power-over-your-products/serenity-enrich-your-products-with-variants)

### Shopify

Shopify variants use options such as size or color. Shopify category/product metafields can be
connected to variant options so option values are reusable across products instead of recreated for
each product.

Design signal for this module:

- Treat common option lists like "Bảng màu" as reusable sources.
- Allow a product/model to select a subset or extend values without losing the source relationship.
- Keep color swatches attached to option entries, not to free-text labels.

References:

- [Shopify — Variants](https://help.shopify.com/en/manual/products/variants)
- [Shopify — Add variants with metafields](https://help.shopify.com/en/manual/custom-data/metafields/add-variants-with-metafields)
- [Shopify — Category metafields](https://help.shopify.com/en/manual/custom-data/metafields/category-metafields)

### Odoo

Odoo manages product variants from product templates or attribute pages. A product template can add
attribute lines and choose the values that apply to that product.

Design signal for this module:

- In the material model editor, "add spec row, then choose applicable values" is the right UI model.
- Repeatable attribute/spec rows are normal when each row represents a different product part or
  variant axis.

Reference:

- [Odoo — Product variants](https://www.odoo.com/documentation/19.0/applications/sales/sales/products_prices/products/variants.html)

### Pimcore

Pimcore's Classification Store is built for flexible category-specific attributes. It supports
keys organized in groups, inheritance, and multiple stores.

Design signal for this module:

- Avoid a huge rigid spec definition list when category/model-specific specs are needed.
- Group reusable keys/options separately from the object values.
- Use inheritance carefully: it is powerful at model/category level, but confusing if every item can
  redefine structure.

References:

- [Pimcore — Classification Store](https://docs.pimcore.com/platform/Pimcore/Objects/Object_Classes/Data_Types/Classification_Store/)
- [Pimcore — Object Bricks vs Classification Store](https://docs.pimcore.com/platform/Pimcore/Objects/Object_Classes/Object_Bricks_vs_Classification_Store/)

## Design Decision

Add two concepts before adding more ad-hoc override flags:

1. `SpecValueSet`: reusable option/value templates, such as "Bảng màu cơ bản" or
   "Bảng màu nhuộm".
2. Repeatable `MaterialModelSpec` instances: the same catalog spec can be assigned multiple times
   to one material model, with a different label/part context.

Do not allow real material/device rows to override spec configuration. A `Material` should only
store values. The model remains the boundary where structure is configured.

### Scope decisions (v1)

This module is a **web template, not a real project** — there is no production data to migrate and no
legacy to preserve. The change is a **clean break**:

- No migration plan, no `allowedOptions` compatibility alias. Rewrite mock data + helpers directly
  to the new shape.
- `optionSource` ships only `inherit | subset` in v1. `extend` and `copy` are **deferred** — they are
  the rarest, most complex modes and overlap with the existing `source: 'custom'` path (a fully
  model-local spec). Revisit only when a real need appears.
- Per-material/device structural override stays out of scope; devices store values only.

The trimmed `inherit | subset` + `valueSetIdOverride` + repeatable instances still covers all three
real cases: magnet pair (multi or two instances), glass/shell colors (same definition twice with
subset), and dye colors (swap value set).

## Proposed Data Model

### SpecValueSet

```ts
export type SpecValueSetKind = 'generic' | 'color';

export interface SpecValueSet {
  id: string;
  code: string;
  name: string;
  kind: SpecValueSetKind;
  description?: string;
  options: SpecOption[];
  isActive: boolean;
}
```

Examples:

- `VS-COLOR-BASIC`: Đen, Trắng, Xanh, Đỏ, Vàng.
- `VS-COLOR-DYE`: a longer dye/powder-coating color list.
- `VS-STORAGE`: 128 GB, 256 GB, 512 GB, 1 TB.

### SpecDefinition

`SpecDefinition` should define the meaning and default behavior of the spec, not own every option
copy directly.

```ts
export type ListSelectionMode = 'single' | 'multi';

export interface SpecDefinition {
  id: string;
  code: string;
  name: string;
  dataType: SpecDataType;
  unit?: string;
  defaultValueSetId?: string;
  defaultSelectionMode?: ListSelectionMode;
  /** Gate: model được đổi single<->multi không. Resolver PHẢI enforce, không chỉ UI. */
  allowModelSelectionOverride: boolean;
  /** Gate: model được đổi value set / chọn subset không. Resolver PHẢI enforce. */
  allowModelValueSetOverride: boolean;
  defaultValue?: SpecValue;
  description?: string;
}
```

Clean break — `options`, `allowMultiple`, `allowDynamicValues`, `allowModelOverride` are removed from
`SpecDefinition`. Option lists live in `SpecValueSet`; "single vs multi" is `defaultSelectionMode`;
override permissions are the two explicit gates above.

### MaterialModelSpec

`MaterialModelSpec` becomes an instance of a spec on a specific model. The instance has a stable ID
because one model may use the same definition more than once.

```ts
// v1: chỉ inherit | subset. extend/copy deferred (xem Scope decisions).
export type MaterialModelSpecOptionSource =
  | { mode: 'inherit' }
  | { mode: 'subset'; optionIds: string[] };

export interface MaterialModelSpec {
  id: string;
  source: 'catalog' | 'custom';
  specDefinitionId?: string;
  customDefinition?: CustomSpecDefinition;

  labelOverride?: string;
  partKey?: string;

  selectionModeOverride?: ListSelectionMode;
  valueSetIdOverride?: string;
  optionSource?: MaterialModelSpecOptionSource;

  materialValueMode: 'locked' | 'editable';
  defaultValue?: SpecValue;
  isRequired: boolean;
  sortOrder: number;
}
```

Field meaning:

- `labelOverride`: user-facing label for this model, e.g. "Màu kính", "Màu vỏ".
- `partKey`: machine key for import/export/reporting, e.g. `glass`, `shell`. **Required and unique
  within one model** when the same `specDefinitionId` is added more than once.
- `selectionModeOverride`: single<->multi. Applied only if `definition.allowModelSelectionOverride`.
- `valueSetIdOverride`: swaps the value set, e.g. basic colors -> dye colors. Applied only if
  `definition.allowModelValueSetOverride`.
- `optionSource`:
  - `inherit`: use the full effective value set.
  - `subset`: use selected option IDs from the effective value set. Applied only if
    `allowModelValueSetOverride`.

### Override precedence & validity

Resolve in a fixed order so the three override fields never contradict:

1. `valueSetIdOverride` resolves **first** → picks the **effective value set**.
2. `optionSource` applies **on top of** that effective value set (`subset.optionIds` reference IDs
   from the value set chosen in step 1, not the definition default).
3. Each gate is enforced by the resolver; a disallowed override is **ignored** (falls back to
   definition default), not just hidden in the UI.

Validity matrix (`*` = any):

| `allowModelValueSetOverride` | `valueSetIdOverride` | `optionSource` | Result |
| --- | --- | --- | --- |
| false | (ignored) | (ignored) | definition value set, full options |
| true | unset | `inherit` | definition value set, full options |
| true | set | `inherit` | overridden value set, full options |
| true | * | `subset` | (overridden or default) value set, filtered to `optionIds` |

### Material

Keep material/device values simple.

```ts
export interface MaterialSpecValue {
  materialModelSpecId: string;
  value: SpecValue;
}
```

No per-material override of `selectionMode`, `valueSet`, or options.

## Case Handling

### Pair Of Magnets With Two Colors

If the business only needs "this model includes two colors":

- one spec instance: `Màu sắc`
- `selectionModeOverride = 'multi'`
- material value: `['color-blue', 'color-red']`

If the business needs position/part meaning:

- spec instance 1: `labelOverride = 'Màu nam châm A'`, value `color-blue`
- spec instance 2: `labelOverride = 'Màu nam châm B'`, value `color-red`

Do not create a combined option like "Xanh-Đỏ" unless it is a real commercial colorway/SKU name that
must be displayed as one label. Even then, consider storing atomic linked colors behind it.

### Model With Glass Color And Shell Color

Use the same `specDefinitionId = spec-color` twice:

```ts
[
  {
    id: 'model-a-color-glass',
    specDefinitionId: 'spec-color',
    labelOverride: 'Màu kính',
    partKey: 'glass',
    optionSource: { mode: 'subset', optionIds: ['color-clear', 'color-smoke'] },
    materialValueMode: 'editable',
  },
  {
    id: 'model-a-color-shell',
    specDefinitionId: 'spec-color',
    labelOverride: 'Màu vỏ',
    partKey: 'shell',
    optionSource: { mode: 'subset', optionIds: ['color-black', 'color-white'] },
    materialValueMode: 'editable',
  },
]
```

This keeps reporting/filtering clean:

- filter by all items using `spec-color = Đỏ`
- filter by `partKey = shell AND spec-color = Đỏ`
- display labels as "Màu kính" / "Màu vỏ" in the form.

### Many Dye Colors

Create a value set such as `Bảng màu nhuộm`.

For each model:

- choose `valueSetIdOverride = VS-COLOR-DYE`, or
- keep default color value set and use `optionSource = { mode: 'subset', optionIds: [...] }`.

A model whose list must diverge permanently from any shared value set is modeled as a `source:
'custom'` spec instead (its own `customDefinition.options`) — there is no `copy` mode in v1.

## UI Flow

### Spec Definition Page

For list specs:

- Configure default selection mode: `Chọn 1` or `Chọn nhiều`.
- Choose default value set.
- Configure whether model can change selection mode.
- Configure whether model can change value set or option subset.

Do not force users to manage long option lists inside every spec definition. Long lists belong in
the value-set page.

### Value Set Page

A tab inside "Danh mục thông số" (`/example/materials/specs`). Promote to its own page later if needed.

Table columns:

- Name/code
- Kind: generic/color
- Option count
- Used by specs/models
- Status/actions

Editor:

- Compact option table: code, label, swatch for color sets.
- Bulk paste/import option codes and labels.
- Warn before deleting options used by existing values.

### Material Model Spec Editor

Change the "add from catalog" behavior:

- Allow adding the same catalog spec more than once.
- When adding a duplicate, require `labelOverride` or `partKey`.
- Surface duplicates clearly in the table:
  - `Màu sắc` / `Màu kính`
  - `Màu sắc` / `Màu vỏ`

Layout: a **3-column list + per-row side drawer**, not a wide multi-column table. The old editor
(`models/components/model-spec-editor.tsx`) packs identity, default value, option-list management and
flags into one `min-w-[1080px]` table that scrolls horizontally; adding the new fields would make it
unusable. Greybox of the new layout (Level 1, dev-only):
`src/examples/material/models/wireframe.tsx` → `/example/material/models/wireframe`.

List columns (dense, no horizontal scroll):

- **Thông số**: effective label + source badge + `partKey` chip (e.g. `Màu kính · glass`).
- **Nguồn giá trị**: one-line summary, e.g. `Bảng màu cơ bản · 5/12 · Chọn nhiều`.
- **Cờ + ⚙**: `Vật tư nhập riêng`, `Bắt buộc`, and a **Cấu hình** button that opens the drawer.

Per-row drawer (`Sheet`) holds the deep config — this is where the old table's clutter moves:

- `labelOverride` + `partKey`.
- selection mode (single/multi) — shown only when `allowModelSelectionOverride`.
- value set picker (`valueSetIdOverride`) — only when `allowModelValueSetOverride`.
- subset = **chip toggle list** pulled from the chosen value set (replaces the old re-declare-options
  dialog).
- default value editor using effective mode + effective options.

The benchmark products converge on this: keep the assignment grid to 2–3 columns and push deep config
into a drawer/detail panel (Contentful/Strapi field drawer, Odoo 2-column line grid, Akeneo
master-detail), instead of widening the grid.

### Material Device Editor

The device editor should remain value-only:

- If `locked`: show read-only formatted value.
- If `editable`: render input based on effective data type and selection mode.
- If list: options come from effective value-set/source resolution.

No controls for changing `selectionMode`, value set, or option list at this level.

## Resolution Rules

Effective definition for a `MaterialModelSpec`:

1. Resolve base definition:
   - custom definition for custom specs
   - catalog definition for catalog specs
2. Resolve effective label:
   - `labelOverride ?? definition.name`
3. Resolve effective selection mode (gated):
   - if `definition.allowModelSelectionOverride`: `selectionModeOverride ?? definition.defaultSelectionMode`
   - else: `definition.defaultSelectionMode` (ignore any `selectionModeOverride`)
4. Resolve effective value set (gated, precedence step 1):
   - if `definition.allowModelValueSetOverride`: `valueSetIdOverride ?? definition.defaultValueSetId`
   - else: `definition.defaultValueSetId`
5. Resolve effective options (on top of step 4's value set):
   - `inherit`: all options from the effective value set
   - `subset`: only options whose IDs are in `optionIds` (gated by `allowModelValueSetOverride`;
     ignored otherwise)
6. Resolve value:
   - locked: `modelSpec.defaultValue ?? definition.defaultValue`
   - editable: material override if valid, else model/default value
7. Constrain invalid values:
   - single: value must be one valid option ID
   - multi: value must be an array of valid option IDs

## Build Plan

Clean break — no migration, no compatibility alias. Each phase ends green
(`npm run build` + targeted tests).

Phase 1: types + mock data

- Add `SpecValueSet` (`model/`) and `spec-value-sets.mock.ts`.
- Rewrite `SpecDefinition` to the new shape (drop `options`/`allowMultiple`/`allowDynamicValues`/
  `allowModelOverride`; add `defaultValueSetId`, `defaultSelectionMode`, the two gates).
- Add `labelOverride`, `partKey`, `selectionModeOverride`, `valueSetIdOverride`, `optionSource`
  (`inherit | subset`) to `MaterialModelSpec`; remove `allowedOptions`.
- Rewrite spec/model/material mock fixtures onto value sets.

Phase 2: resolver

- Replace `optionsForSpec` with an effective-options resolver implementing the precedence + gates
  above. Add an effective-selection-mode + effective-label resolver.
- Tests:
  - duplicate `specDefinitionId` on one model (glass/shell)
  - gated single -> multi override (allowed vs disallowed → disallowed is ignored)
  - `inherit` vs `subset` against base and overridden value set
  - disallowed `valueSetIdOverride`/`subset` ignored by resolver
  - invalid material values constrained (single/multi)

Phase 3: UI

- `ModelSpecEditor`: 3-column list + per-row drawer per the wireframe; allow duplicate catalog rows;
  require unique `partKey` on duplicates; subset = chip toggle from value set.
- Spec definition page: default selection mode, default value set, two gate toggles.
- Value Sets: tab under "Danh mục thông số" with the compact option editor (code/label/swatch + bulk
  paste).
- Device editor stays value-only on effective resolution.

## Guardrails

- Do not encode multi-value meaning into one option label unless it is truly one business value.
- Do not allow per-material/device config override.
- Keep option IDs stable even when labels change.
- Keep color swatches on value-set option entries, not on free text.
- Require a unique `partKey` when the same catalog spec is added more than once to one model.
- Gates are enforced in the resolver, not only in the UI.

## Resolved Decisions

- **Value sets**: start as a **tab inside "Danh mục thông số"**, promote to its own page only if a
  second value-set kind needs independent management.
- **`selectionModeOverride`**: allowed **only when the definition opts in** (`allowModelSelectionOverride`).
- **`extend` / `copy`**: deferred from v1; permanent divergence uses `source: 'custom'`.
- **Composite colorway**: not now — keep atomic colors + multi/two-instance.

## Open Questions

- Import/export column suffix using `partKey`, e.g. `color.glass` / `color.shell` — confirm format
  when an import/export surface is actually built.
