# Layout builder

The layout builder scaffolds a reusable content-area wrapper around the shared
`ContentLayout` component. It owns serializable defaults; the generated
component receives `navigation` and `content` as React nodes so screens can
compose tree, tabbar, table, form, or custom builder output in each slot.

## Spec

```ts
import type { LayoutSpec } from '@/builders/layout';

const spec = {
  componentName: 'GeneratedTwoColumnContentLayout',
  specPath: 'src/examples/content-layouts/layout/content-layout.fixture.ts',
  defaults: {
    navigationSize: 'md',
    navigationMinSize: 'sm',
    navigationMaxSize: 'xl',
    navigationHeight: 'fit',
    contentHeight: 'fit',
    navigationResizable: false,
  },
} satisfies LayoutSpec;
```

Supported defaults:

- `navigationSize`: `sm | md | lg | xl` preset width.
- `navigationMinSize` / `navigationMaxSize`: resize bounds from the same width registry.
- `navigationHeight` / `contentHeight`: `fit | fill`.
- `navigationResizable`: enables the resize handle by default.

Generate with:

```sh
npm run gen:layout -- src/examples/content-layouts/layout/content-layout.fixture.ts src/examples/content-layouts/components/generated-two-column-content-layout.tsx
```

The generated component exposes the same values as optional props, allowing a
screen to override defaults without changing the generated file:

```tsx
<GeneratedTwoColumnContentLayout
  navigation={<MaterialGroupTreePanel />}
  content={<MaterialModelsTable />}
  navigationHeight="fill"
  contentHeight="fill"
/>
```

Business state and builder children remain outside the generated wrapper.

## Presets

Use the shared preset registry when a new page follows a common content shape:

```ts
import { layoutPresets } from '@/builders/layout';

const spec = {
  componentName: 'GeneratedFullHeightSplitLayout',
  defaults: {
    ...layoutPresets.fullHeightSplit.defaults,
    navigationResizable: true,
  },
};
```

Available presets:

- `layoutPresets.contentFit`: navigation follows its content and the main area uses the normal page scroll behavior.
- `layoutPresets.fullHeightSplit`: navigation and content fill the layout height; the data area owns its internal scroll while the footer stays visible.

Presets are starting points, not locks. Override individual defaults when a page has a slightly different navigation width, height mode, or resize behavior.
