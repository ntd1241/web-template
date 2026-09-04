import { describe, expect, it } from 'vitest';
import { buildDialogModule } from './dialog-builder';
import { dialogSpecSchema } from './dialog-spec';

const baseSpec = {
  componentName: 'ContractDialog',
  title: 'Hợp đồng',
  actions: [
    { name: 'cancel', label: 'Hủy', variant: 'outline' },
    { name: 'confirm', label: 'Xác nhận', variant: 'primary' },
  ],
} as const;

describe('dialog-builder', () => {
  it('emits standard dialog chrome, content slot, and footer actions', () => {
    const source = buildDialogModule({
      ...baseSpec,
      description: 'Mô tả dialog',
      width: 'xl',
      actions: [
        baseSpec.actions[0],
        {
          name: 'confirm',
          label: 'Lưu',
          variant: 'primary',
          icon: 'Check',
          loadingProp: 'isSaving',
          loadingText: 'Đang lưu...',
        },
      ],
    });

    expect(source).toContain('Scaffolded by dialog-builder');
    expect(source).toContain('DialogDescription');
    expect(source).toContain('max-w-xl flex-col gap-0 overflow-hidden p-0');
    expect(source).toContain(
      'className="shrink-0 space-y-1.5 px-6 py-5 pe-14 text-start"',
    );
    expect(source).toContain(
      'className="min-h-0 flex-1 overflow-y-auto px-6 py-5"',
    );
    expect(source).toContain('className="shrink-0 px-6 py-4"');
    expect(source).toContain('{children}');
    expect(source).toContain('onConfirm: () => void;');
    expect(source).toContain('isSaving?: boolean;');
    expect(source).toContain("loadingText='Đang lưu...'");
    expect(source).toContain('<Check />');
  });

  it('omits the description import and element when not configured', () => {
    const source = buildDialogModule(baseSpec);

    expect(source).not.toContain('DialogDescription');
  });

  it('allows a dynamic title prop to contain styled title content', () => {
    const source = buildDialogModule({
      ...baseSpec,
      titleProp: 'dialogTitle',
    });

    expect(source).toContain('dialogTitle: ReactNode;');
    expect(source).toContain('<DialogTitle>{dialogTitle}</DialogTitle>');
  });

  it('rejects duplicate action names and loading text without a loading prop', () => {
    expect(() =>
      dialogSpecSchema.parse({
        ...baseSpec,
        actions: [
          { name: 'cancel', label: 'Hủy' },
          { name: 'cancel', label: 'Đóng' },
        ],
      }),
    ).toThrow(/action name bị trùng/);

    expect(() =>
      dialogSpecSchema.parse({
        ...baseSpec,
        actions: [
          { name: 'confirm', label: 'Lưu', loadingText: 'Đang lưu...' },
        ],
      }),
    ).toThrow(/loadingText cần có loadingProp/);
  });

  it('rejects an empty action list', () => {
    expect(() =>
      dialogSpecSchema.parse({ ...baseSpec, actions: [] }),
    ).toThrow();
  });
});
