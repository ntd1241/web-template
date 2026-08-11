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

export default spec;
