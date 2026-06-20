import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

  function DialogHarness() {
    const form = useSupplierForm();

    return (
      <SupplierFormDialog
        open
        onOpenChange={() => {}}
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
});
