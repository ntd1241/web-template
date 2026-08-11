import { describe, expect, it } from 'vitest';
import { buildLayoutModule } from './layout-builder';
import { layoutSpecSchema, type LayoutSpec } from './layout-spec';

const baseSpec = {
  componentName: 'GeneratedContentLayout',
  defaults: {
    navigationSize: 'md',
    navigationMinSize: 'sm',
    navigationMaxSize: 'xl',
    navigationHeight: 'fit',
    contentHeight: 'fill',
    navigationResizable: true,
  },
} satisfies LayoutSpec;

describe('layout-builder', () => {
  it('emits slots and all layout configuration overrides', () => {
    const source = buildLayoutModule(baseSpec);

    expect(source).toContain('navigation: ReactNode;');
    expect(source).toContain('content: ReactNode;');
    expect(source).toContain('navigationMinSize?: LayoutAreaSize;');
    expect(source).toContain('contentHeight?: LayoutAreaHeight;');
    expect(source).toContain('navigationResizable: true,');
    expect(source).toContain(
      'contentHeight = GeneratedContentLayoutDefaults.contentHeight',
    );
    expect(source).toContain('<ContentLayout');
  });

  it('fills default layout values when the spec omits defaults', () => {
    const source = buildLayoutModule({
      componentName: 'DefaultContentLayout',
    });

    expect(source).toContain("navigationSize: 'md'");
    expect(source).toContain("navigationMinSize: 'sm'");
    expect(source).toContain("navigationMaxSize: 'xl'");
    expect(source).toContain("navigationHeight: 'fit'");
    expect(source).toContain("contentHeight: 'fit'");
    expect(source).toContain('navigationResizable: false');
  });

  it('rejects an invalid resize range', () => {
    expect(() =>
      layoutSpecSchema.parse({
        ...baseSpec,
        defaults: {
          ...baseSpec.defaults,
          navigationMinSize: 'xl',
          navigationMaxSize: 'sm',
        },
      }),
    ).toThrow(/navigationMinSize không được lớn hơn navigationMaxSize/);
  });
});
