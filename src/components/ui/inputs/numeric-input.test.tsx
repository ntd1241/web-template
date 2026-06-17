import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NumericInput } from './numeric-input';

describe('NumericInput', () => {
  it('renders a number with Vietnamese grouping separators', () => {
    render(<NumericInput aria-label="Số tiền" value={1234567} />);

    expect(screen.getByRole('textbox', { name: 'Số tiền' })).toHaveValue(
      '1.234.567',
    );
  });

  it('fires onValueChange with a numeric value when typing', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <NumericInput aria-label="Số lượng" onValueChange={handleValueChange} />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Số lượng' }), '1234');

    expect(handleValueChange).toHaveBeenLastCalledWith(1234);
  });

  it('fires undefined when emptied', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();

    render(
      <NumericInput
        aria-label="Số lượng"
        value={1000}
        onValueChange={handleValueChange}
      />,
    );

    await user.clear(screen.getByRole('textbox', { name: 'Số lượng' }));

    expect(handleValueChange).toHaveBeenLastCalledWith(undefined);
  });
});
