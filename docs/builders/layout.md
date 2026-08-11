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
