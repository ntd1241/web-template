import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ShowcaseSegmentedControl } from './showcase.segmented-control.generated';

describe('generated segmented control render proof', () => {
  it('renders options and reports a changed selection', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ShowcaseSegmentedControl value="one" onValueChange={onValueChange} />,
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Hai' }));

    expect(onValueChange).toHaveBeenCalledWith('two');
  });
});
