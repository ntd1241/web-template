import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tag } from './tag';

describe('Tag', () => {
  it('renders the tag color across text, outline, and background', () => {
    render(<Tag color="#2563eb">Nhân viên</Tag>);

    expect(screen.getByText('Nhân viên')).toHaveStyle({
      color: '#2563eb',
      borderColor: 'rgba(37, 99, 235, 0.45)',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
    });
  });

  it('falls back to a neutral color for an invalid value', () => {
    render(<Tag color="invalid">Chưa phân loại</Tag>);

    expect(screen.getByText('Chưa phân loại')).toHaveStyle({
      color: '#64748b',
      borderColor: 'rgba(100, 116, 139, 0.45)',
      backgroundColor: 'rgba(100, 116, 139, 0.1)',
    });
  });
});
