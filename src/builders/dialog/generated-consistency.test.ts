import { describe, expect, it } from 'vitest';
import { buildDialogModule } from './dialog-builder';

describe('dialog-builder generated consistency', () => {
  it('keeps generated output marked as scaffold-and-own', () => {
    const generated = buildDialogModule({
      componentName: 'ConsistencyDialog',
      title: 'Kiểm tra',
      actions: [{ name: 'close', label: 'Đóng', variant: 'outline' }],
    });

    expect(generated).toContain('Scaffolded by dialog-builder');
    expect(generated).toContain('DialogBody');
    expect(generated).toContain('children: ReactNode;');
    expect(generated).not.toContain(': any');
  });
});
