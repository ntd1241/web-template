import { render, screen } from '@testing-library/react';
import { Save } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders native loading state with spinner, loading text, and disabled state', () => {
    render(
      <Button loading loadingText="Đang lưu">
        <Save />
        Lưu nhân viên
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Đang lưu' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('svg.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Lưu nhân viên')).not.toBeInTheDocument();
  });

  it('keeps a single slotted child when loading with asChild', () => {
    render(
      <Button asChild loading>
        <a href="/employees">Mở danh sách</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Mở danh sách' });

    expect(link).toHaveAttribute('aria-busy', 'true');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link.querySelector('svg.animate-spin')).not.toBeInTheDocument();
  });
});
