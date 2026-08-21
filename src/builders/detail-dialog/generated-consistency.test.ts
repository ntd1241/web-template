import { describe, expect, it } from 'vitest';
import { buildDetailDialogModule } from './detail-dialog-builder';

describe('detail-dialog-builder generated consistency', () => {
  it('keeps generated output scaffold-and-own and free of any', () => {
    const generated = buildDetailDialogModule({
      componentName: 'DetailDialog',
      tabs: [{ value: 'summary', label: 'Tóm tắt' }],
    });

    expect(generated).toContain('Scaffolded by detail-dialog-builder');
    expect(generated).toContain('<EntityDetailDialog<TData>');
    expect(generated).toContain('<EntityDetailDialogTable');
    expect(generated).not.toContain(': any');
  });
});
