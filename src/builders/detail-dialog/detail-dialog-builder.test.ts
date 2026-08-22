import { describe, expect, it } from 'vitest';
import { buildDetailDialogModule } from './detail-dialog-builder';
import {
  detailDialogSpecSchema,
  type DetailDialogSpec,
} from './detail-dialog-spec';

const baseSpec = {
  componentName: 'GeneratedDetailDialog',
  tabs: [
    {
      value: 'overview',
      label: 'Tổng quan',
      icon: 'Info',
      searchTextProp: 'overviewSearchText',
    },
    {
      value: 'history',
      label: 'Lịch sử',
      contentMode: 'custom',
      contentProp: 'historyPanel',
      searchMatchCountProp: 'historySearchMatchCount',
    },
  ],
} satisfies DetailDialogSpec;

describe('detail-dialog-builder', () => {
  it('emits local-data content slots and fuzzy search callbacks', () => {
    const source = buildDetailDialogModule(baseSpec);

    expect(source).toContain('data: TData | null;');
    expect(source).toContain(
      'overviewFields: (context: EntityDetailDialogTabContext<TData>) => EntityDetailDialogField[];',
    );
    expect(source).toContain('overviewSearchText?: (data: TData) => string;');
    expect(source).toContain('historyPanel:');
    expect(source).toContain(
      'historySearchMatchCount?: (context: EntityDetailDialogTabContext<TData>) => number;',
    );
    expect(source).toContain('getMatchCount: historySearchMatchCount');
    expect(source).toContain('countMatchingEntityDetailDialogFields');
    expect(source).toContain('<EntityDetailDialogTable');
    expect(source).toContain('import { Info } from');
    expect(source).toContain("defaultTab='overview'");
  });

  it('uses the first tab as the default when defaultTab is omitted', () => {
    const source = buildDetailDialogModule({
      componentName: 'DefaultDetailDialog',
      tabs: [{ value: 'summary', label: 'Tóm tắt' }],
    });

    expect(source).toContain("defaultTab='summary'");
    expect(source).not.toContain('lucide-react');
  });

  it('rejects duplicate tab, content, search props and unknown defaults', () => {
    expect(() =>
      detailDialogSpecSchema.parse({
        ...baseSpec,
        tabs: [
          { value: 'overview', label: 'Tổng quan' },
          { value: 'overview', label: 'Lịch sử' },
        ],
      }),
    ).toThrow(/tab value bị trùng/);

    expect(() =>
      detailDialogSpecSchema.parse({
        ...baseSpec,
        tabs: [
          {
            value: 'overview',
            label: 'Tổng quan',
            contentMode: 'custom',
            contentProp: 'panel',
          },
          {
            value: 'history',
            label: 'Lịch sử',
            contentMode: 'custom',
            contentProp: 'panel',
          },
        ],
      }),
    ).toThrow(/content slot bị trùng/);

    expect(() =>
      detailDialogSpecSchema.parse({
        ...baseSpec,
        tabs: [
          {
            value: 'overview',
            label: 'Tổng quan',
            searchTextProp: 'search',
          },
          {
            value: 'history',
            label: 'Lịch sử',
            searchTextProp: 'search',
          },
        ],
      }),
    ).toThrow(/searchTextProp bị trùng/);

    expect(() =>
      detailDialogSpecSchema.parse({
        ...baseSpec,
        tabs: [
          {
            value: 'overview',
            label: 'Tổng quan',
            searchMatchCountProp: 'count',
          },
          {
            value: 'history',
            label: 'Lịch sử',
            searchMatchCountProp: 'count',
          },
        ],
      }),
    ).toThrow(/searchMatchCountProp bị trùng/);

    expect(() =>
      detailDialogSpecSchema.parse({
        ...baseSpec,
        defaultTab: 'missing',
      }),
    ).toThrow(/defaultTab không tồn tại/);
  });
});
