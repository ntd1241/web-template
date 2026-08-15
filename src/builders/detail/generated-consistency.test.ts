import { describe, expect, it } from 'vitest';
import { buildDetailModule } from './detail-builder';

describe('detail-builder generated consistency', () => {
  it('keeps generated output scaffold-and-own and free of any', () => {
    const generated = buildDetailModule({
      componentName: 'DetailLayout',
      tabs: [{ value: 'summary', label: 'Tóm tắt' }],
    });

    expect(generated).toContain('Scaffolded by detail-builder');
    expect(generated).toContain('<EntityDetailLayout');
    expect(generated).not.toContain(': any');
  });
});
