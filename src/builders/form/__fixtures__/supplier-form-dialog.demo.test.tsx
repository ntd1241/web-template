import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SupplierFormDialog } from './supplier-form-dialog.generated';

/**
 * Render-proof for the form-builder golden: the generated dialog must actually
 * mount (react-hook-form + every input kind) and render its fields, not just
 * typecheck. Co-located with the fixture.
 */
describe('form-builder golden — render proof', () => {
  it('mounts the dialog and renders title, fields and footer', () => {
    render(<SupplierFormDialog open onOpenChange={() => {}} />);

    expect(screen.getByText('Thêm nhà cung cấp')).toBeInTheDocument();
    expect(screen.getByText('Mã NCC')).toBeInTheDocument();
    expect(screen.getByText('Khu vực')).toBeInTheDocument(); // combobox field
    expect(screen.getByText('Ghi chú')).toBeInTheDocument(); // textarea field
    expect(screen.getByText('Kích hoạt ngay')).toBeInTheDocument(); // switch field
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
  });
});
