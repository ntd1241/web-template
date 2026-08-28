import { render, screen } from '@testing-library/react';
import { Save } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { DataGridDrawerAction } from './data-grid-drawer-action';

describe('DataGridDrawerAction', () => {
  it('replaces the action icon with one loading spinner', () => {
    render(
      <DataGridDrawerAction
        icon={Save}
        label="Lưu cấu hình"
        loading
        onClick={vi.fn()}
      />,
    );

    const button = screen.getByRole('button', { name: 'Lưu cấu hình' });

    expect(button.querySelectorAll('svg')).toHaveLength(1);
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
  });
});
