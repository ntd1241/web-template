import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  SupplierForm,
  SupplierFormDialog,
  useSupplierForm,
} from './supplier-form.generated';

/**
 * Render-proof for the form-builder golden: the generated dialog must actually
 * mount (react-hook-form + every input kind) and render its fields, not just
 * typecheck. Co-located with the fixture.
 */
describe('form-builder golden — render proof', () => {
  const regionOptions = [{ value: 'mien-bac', label: 'Miền Bắc' }];

  function DialogHarness({
    mode = 'create',
    onOpenChange = () => {},
  }: {
    mode?: 'create' | 'edit';
    onOpenChange?: (open: boolean) => void;
  }) {
    const form = useSupplierForm();

    return (
      <SupplierFormDialog
        open
        onOpenChange={onOpenChange}
        mode={mode}
        form={form}
        onSubmit={() => {}}
        regionOptions={regionOptions}
      />
    );
  }

  function InlineHarness() {
    const form = useSupplierForm();

    return (
      <SupplierForm
        form={form}
        onSubmit={() => {}}
        regionOptions={regionOptions}
      />
    );
  }

  it('mounts the dialog and renders title, fields and footer', () => {
    render(<DialogHarness />);

    expect(screen.getByText('Thêm nhà cung cấp')).toBeInTheDocument();
    expect(screen.getByText('Mã NCC')).toBeInTheDocument();
    expect(screen.getByText('Khu vực')).toBeInTheDocument(); // combobox field
    expect(screen.getByText('Ghi chú')).toBeInTheDocument(); // textarea field
    expect(screen.getByText('Kích hoạt ngay')).toBeInTheDocument(); // switch field
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
  });

  it('renders the inline form grid without dialog chrome', () => {
    render(<InlineHarness />);

    expect(screen.getByText('Mã NCC')).toBeInTheDocument();
    expect(screen.queryByText('Thêm nhà cung cấp')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Lưu' }),
    ).not.toBeInTheDocument();
  });

  it('renders prop-fed combobox options', () => {
    render(<InlineHarness />);

    fireEvent.click(screen.getAllByRole('combobox')[1]);

    expect(screen.getByText('Miền Bắc')).toBeInTheDocument();
  });

  it('confirms before closing an edit dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<DialogHarness mode="edit" onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Hủy' }));

    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Bạn có thay đổi chưa lưu.',
    );
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    await user.click(screen.getByRole('button', { name: 'Đóng' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('closes a create dialog directly so its draft can be reopened', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(<DialogHarness onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Hủy' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
