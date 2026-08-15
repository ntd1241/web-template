import { describe, expect, it } from 'vitest';
import { buildDetailModule } from './detail-builder';
import { detailSpecSchema, type DetailSpec } from './detail-spec';

const baseSpec = {
  componentName: 'GeneratedDetailLayout',
  tabs: [
    { value: 'overview', label: 'Tổng quan', icon: 'Info' },
    { value: 'history', label: 'Lịch sử', contentProp: 'historyPanel' },
  ],
} satisfies DetailSpec;

describe('detail-builder', () => {
  it('emits profile, information and tab content slots', () => {
    const source = buildDetailModule(baseSpec);

    expect(source).toContain('profile: ReactNode;');
    expect(source).toContain('information: ReactNode;');
    expect(source).toContain('overviewContent: ReactNode;');
    expect(source).toContain('historyPanel: ReactNode;');
    expect(source).toContain('import { Info } from');
    expect(source).toContain("defaultValue='overview'");
  });

  it('uses the first tab as the default when defaultTab is omitted', () => {
    const source = buildDetailModule({
      componentName: 'DefaultDetailLayout',
      tabs: [{ value: 'summary', label: 'Tóm tắt' }],
    });

    expect(source).toContain("defaultValue='summary'");
    expect(source).not.toContain('lucide-react');
  });

  it('rejects duplicate tabs, duplicate content props and unknown defaults', () => {
    expect(() =>
      detailSpecSchema.parse({
        ...baseSpec,
        tabs: [
          { value: 'overview', label: 'Tổng quan' },
          { value: 'overview', label: 'Lịch sử' },
        ],
      }),
    ).toThrow(/tab value bị trùng/);

    expect(() =>
      detailSpecSchema.parse({
        ...baseSpec,
        tabs: [
          { value: 'overview', label: 'Tổng quan', contentProp: 'panel' },
          { value: 'history', label: 'Lịch sử', contentProp: 'panel' },
        ],
      }),
    ).toThrow(/contentProp bị trùng/);

    expect(() =>
      detailSpecSchema.parse({
        ...baseSpec,
        defaultTab: 'missing',
      }),
    ).toThrow(/defaultTab không tồn tại/);
  });
});
